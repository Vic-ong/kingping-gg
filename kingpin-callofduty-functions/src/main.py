from flask import abort
from settings import env
from utils.request import use_method, cors
from utils.errors import Error
from services import Firebase
from services import CallOfDuty
from slack import WebClient
from slack.errors import SlackApiError


def slack_chat_post(msg):
    try:
        client = WebClient(token=env('SLACK_API_TOKEN'))
        client.chat_postMessage(
            channel=env('SLACK_CHANNEL'),
            text=msg,
        )
    except SlackApiError as e:
        # You will get a SlackApiError if "ok" is False
        print(f'Slack Error: {e.response["error"]}')


# [START functions_http_send_slack_message]
# Determines if the activision_id(s) is valid
def send_slack_message(request):
    """
    message: str -- slack message
    """
    method = 'POST'
    status = 200
    res = {}
    headers = {}
    try:
        if request.method == 'OPTIONS': return cors(method)
        headers = use_method(request, method)
        
        request_json = request.get_json(silent=True)
        message = request_json.get('message')

        if message:
            client = WebClient(token=env('SLACK_API_TOKEN'))
            client.chat_postMessage(
                channel=env('SLACK_CLIENT_CHANNEL'),
                text=message,
            )

            res['result'] = { 'text': message }
        else:
            status, res = Error.missingParams(['message'])
        return (res, status, headers)

    except Exception as err:
        print(err)
        status, res = Error.internalError(err.response["error"])
        return (res, status, headers)
# [END functions_http_send_slack_message]


# [START functions_http_betting_odds]
# Calculate the winning odds by categories
def betting_odds(request):
    """
    user_id: str -- User's ID
    activision_id: str -- Activision ID
    party_ids: str[] -- Teammate's Activision IDs
    mode: str -- Game mode
    """
    method = 'POST'
    status = 200
    res = {}
    headers = {}
    try:
        if request.method == 'OPTIONS': return cors(method)
        headers = use_method(request, method)

        firebase = Firebase(env)
        service_acc = firebase.get_service_credential()

        request_json = request.get_json(silent=True)
        user_id = request_json.get('user_id')
        platform_id = request_json.get('platform_id')
        activision_id = request_json.get('activision_id')
        mode = request_json.get('mode')
        metadata = request_json.get('metadata')

        if user_id and mode:
            cod = CallOfDuty(
                firebase=firebase,
                service_acc=service_acc,
                user_id=user_id,
                activision_id=activision_id,
                platform_id=platform_id,
                mode=mode
            )
            betting_odds = cod.get_betting_odds()

            res = betting_odds if metadata else { 'result': betting_odds['result'] }
        else:
            status, res = Error.missingParams(['user_id', 'activision_id', 'mode'])
        return (res, status, headers)

    except Exception as err:
        status, res = Error.internalError(err)
        return (res, status, headers)
# [END functions_http_betting_odds]


# [START functions_pubsub_find_match_outcome]
# Find played matches and update match data on the database
def find_match_outcome(data, context):
    from controllers import FindMatchOutcome

    try:
        FindMatchOutcome(env, debug=True).execute()
    except Exception as err:
        print(err)
        slack_chat_post(f'Error in FindMatchOutcome!\n```{err}```')
# [END functions_pubsub_find_match_outcome]

