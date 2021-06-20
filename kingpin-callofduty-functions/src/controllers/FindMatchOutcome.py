from datetime import datetime, timezone, timedelta
from services import Firebase
from services import CallOfDuty
from controllers import Match
from slack import WebClient
from slack.errors import SlackApiError

# default to last 1 hour
def dt_query():
    current_dt = datetime.now(timezone.utc)
    return current_dt - timedelta(hours=1, minutes=20)

class FindMatchOutcome:
    def __init__(self, env, debug = False):
        self.debug = debug
        self.env = env
        self.firebase = Firebase(env)
        self.slack_logs = []
        self.slack = WebClient(token=env('SLACK_API_TOKEN'))
        self.datetime_now = datetime.now(timezone.utc)
        self.current_time = round(datetime.now(timezone.utc).timestamp()) * 1000
    
    def execute(self):
        # find wager records with
        # - outcome == "pending"
        # - created_at >= within 1 hour of current time
        wagers = self.firebase.get_wagers(limit=200, dt_query=dt_query())
        self.print_debug(f'Found {len(wagers)} wager docs')

        if not wagers:
            return

        for wager in wagers:
            wager_id = wager.id
            wager_data = wager.to_dict()

            # temporary
            if 'kioskbuy' in wager_data['betting_odds']['_id']:
                continue

            user_id = wager_data['user']['_id']
            user_name = f'{wager_data["user"]["first_name"]} {wager_data["user"]["last_name"]}'
            user_activision_id = wager_data['user']['activision_id']
            bet_amount = wager_data['amount']
            created_at = wager_data['created_at']
            self.print_debug(f'Processing wager: {wager_id}; {user_name} ({user_activision_id.lower()})')

            start_time = round(created_at.timestamp() * 1000)
            end_time = start_time + (60 * 60 * 1000)

            # if expired, set invalid match and return user's bet amount
            if self.is_expired(start_time):
                self.update_expired(wager_id, user_id, bet_amount)
                self.send_slack_msg()
                continue

            # find matches earlest match of the wager's created time
            closest_match = self.find_closest_match(user_id, user_activision_id, start_time, end_time, wager_data['mode'], wager_id)
            if not closest_match:
                continue

            match_id = closest_match['matchID']
            bet_data = wager_data['betting_odds']
            payout = wager_data['payout']
            self.print_debug(f'wager_id: {wager_id}; match_id: {match_id}; user_id: {user_id}')

            # add match record to the db
            self.firebase.create_record(collection='matches', doc_id=match_id, params=closest_match)
            self.print_debug('Created a match doc')

            # determine the match outcome and update records
            verdict = Match.verdict(closest_match, bet_data)
            self.firebase.update_record(
                collection='wagers',
                doc_id=wager_id,
                update_params={
                    'status': 'resolved' if wager_data['status'] != 'user_concede_defeat' else 'user_concede_defeat',
                    'outcome': verdict,
                    'match_id': match_id,
                    'updated_at': self.datetime_now,
                }
            )
            self.print_debug('Updated wager doc')

            if verdict == 'won':
                self.print_debug(f'Wager outcome -- won')
                self.update_balance(user_id, payout, 'wager payout')
                self.send_slack_msg()
            else:
                self.print_debug(f'Wager outcome -- lost')
                self.send_slack_msg()


    def execute_test(self):
        # find wager records with
        wagers = self.firebase.get_wagers(outcome="won", limit=10, dt_query=dt_query())
        self.print_debug(f'Found {len(wagers)} wager docs')

        if not wagers:
            return

        for wager in wagers:
            wager_id = wager.id
            wager_data = wager.to_dict()
            user_id = wager_data['user']['_id']
            user_name = f'{wager_data["user"]["first_name"]} {wager_data["user"]["last_name"]}'
            user_activision_id = wager_data['user']['activision_id']
            created_at = wager_data['created_at']
            self.print_debug(f'Processing wager: {wager_id}; {user_name} ({user_activision_id.lower()})')

            start_time = round(created_at.timestamp() * 1000)
            end_time = start_time + (60 * 60 * 1000)

            # find matches earlest match of the wager's created time
            closest_match = self.find_closest_match(user_id, user_activision_id, start_time, end_time, wager_data['mode'], wager_id)
            if not closest_match:
                continue

            match_id = closest_match['matchID']
            bet_data = wager_data['betting_odds']
            self.print_debug(f'wager_id: {wager_id}; match_id: {match_id}; user_id: {user_id}')

            # determine the match outcome and update records
            verdict = Match.verdict(closest_match, bet_data)
            print(f'verdict found: {verdict}')


    def update_expired(self, wager_id, user_id, bet_amount):
        self.firebase.update_record(
            collection='wagers',
            doc_id=wager_id,
            update_params={
                'outcome': 'invalid',
                'status': 'no_matches_found',
                'updated_at': self.datetime_now,
            }
        )
        self.print_debug('No matches in the past hour, expired')
        self.update_balance(user_id, bet_amount, 'wager expired')


    def find_closest_match(self, user_id, user_activision_id, start_time, end_time, wager_mode, wager_id):
        service_acc = self.firebase.get_service_credential()
        cod = CallOfDuty(firebase=self.firebase, service_acc=service_acc, user_id=user_id, activision_id=user_activision_id)
        matches = cod.get_matches(
            activision_id=user_activision_id,
            start_time=start_time,
            end_time=end_time,
            limit=10
        )
        self.print_debug(f'Found {len(matches)} match docs from Warzone')

        if not matches:
            return None

        # check if the match outcome should be processed
        closest_match = None

        for match in matches:
            match_mode = match['mode']
            match_start_time = match['utcStartSeconds'] * 1000
            mode_matches = match_mode == wager_mode or self.is_special_event(wager_id, wager_mode, match_mode)
            start_time_matches = 0 < (match_start_time - start_time) < (5 * 60 * 1000)
            if mode_matches and start_time_matches:
                closest_match = match
                break
        
        return closest_match


    def is_special_event(self, wager_id, wager_mode, match_mode):
        event_mode = 'br_brduohwn'
        if match_mode == event_mode and wager_mode == 'br_brduos':
            self.firebase.update_record(
                collection='wagers',
                doc_id=wager_id,
                update_params={
                    'event': {
                        'mode': event_mode,
                        'description': 'BR DUO DIE'
                    },
                    'updated_at': self.datetime_now,
                }
            )
            return True
        # additional events
        return False


    def convert_to_balance(self, value):
        currency = str(value / 100).split('.')
        dollars = currency[0]
        if len(currency) == 2:
            cents = currency[1]
            if (len(cents) == 1):
                cents = cents + '0'
        else:
            cents = 0
        return {
            'currency': 'USD',
            'dollars': int(dollars),
            'cents': int(cents),
        }


    def update_balance(self, user_id, amount, transactionDesc):
        user = self.firebase.get_record(collection='users', doc_id=user_id)
        balance = user['current_balance']
        balance_val = (balance['dollars'] * 100) + balance['cents']
        new_balance_val = balance_val + (amount * 100)
        new_balance = self.convert_to_balance(new_balance_val)

        self.create_transaction(amount, transactionDesc, {
            '_id': user_id,
            'first_name': user['first_name'],
            'last_name': user['last_name'],
            'previous_balance': balance,
            'current_balance': new_balance,
        })
        
        self.firebase.update_record(
            collection='users',
            doc_id=user_id,
            update_params={
                'current_balance': new_balance,
                'updated_at': self.datetime_now,
            }
        )
        self.print_debug(f'Updated balance: ${balance_val / 100} --> ${new_balance_val / 100}')


    def create_transaction(self, amount, description, user):
        self.firebase.create_record(
            doc_id=None,
            collection='transactions',
            params={
                'amount': -amount,
                'description': description,
                'user': user,
                'created_at': self.datetime_now,
                'updated_at': self.datetime_now,
            }
        )


    def is_expired(self, start_time):
        return self.current_time - start_time > (60 * 60 * 1000)


    def print_debug(self, msg):
        if self.debug:
            self.slack_logs.append(msg)
            print(msg)


    def send_slack_msg(self):
        try:
            msg = "\n".join(str(x) for x in self.slack_logs)
            time_str = self.datetime_now.strftime("UTC time -- %b %d %Y %H:%M:%S")
            self.slack.chat_postMessage(
                channel=self.env('SLACK_CHANNEL'),
                text=f'{time_str}\n```{msg}```'
            )
        except SlackApiError as e:
            # You will get a SlackApiError if "ok" is False
            print(f'Slack Error: {e.response["error"]}')

        self.slack_logs = []
