from typing import List, Dict, Tuple
import numpy as np
import asyncio
from .enums import Mode, Platform, Title
from callofduty import Login

await_req = asyncio.get_event_loop().run_until_complete

def get_item(list, index, default):
    try:
        val = list[index]
    except IndexError:
        val = default
    return val

modes = {
    'br_brsolo': 1,
    'br_brduos': 2,
    'br_brtrios': 3,
    'br_brquads': 4,
}

empty_odds = { 'result': [], 'metadata': {} }

class CallOfDuty:
    def __init__(
        self,
        firebase,
        service_acc: Dict,
        user_id: str,
        activision_id: str,
        platform_id: Dict,
        mode: str,
    ):
        self.firebase = firebase
        self.user_id = user_id
        self.activision_id = activision_id
        self.username = platform_id.get('username', None)
        self.mode = mode
        self.mode_val = modes.get(mode, None)
        
        self._client = await_req(Login(service_acc['email'], service_acc['password']))
        self._platform = platform_id.get('platform', 'xbl')
        self._title = Title.ModernWarfare.value
        self._mode = Mode.Warzone.value

    """
    Get the user's latest match
    """
    def get_matches(self, start_time: int = 0, end_time: int = 0, limit = 1) -> List[Dict]:
        matches_res = await_req(self._client.http.GetPlayerMatchesDetailed(
            self._platform,
            self.username,
            self._title,
            self._mode,
            limit,
            start_time,
            end_time,
        ))
        matches = matches_res['data'].get('matches', [])
        return matches


    """
    Get a list of betting odds for user
    """
    def get_betting_odds(self) -> Dict:
        return self._get_kills_odds()

    
    def _get_kills_odds(self) -> Dict:
        records = self._get_kill_records(1)
        return self._calc_kill_odds(records) if records['kills'] else empty_odds


    def _calc_kill_odds(self, records) -> Dict:
        # if we have less than 20 records, we will not provide any odds
        items = np.array(records['kills'])
        n = items.size
        if n < 20:
            return {
                'result': [],
                'metadata': {
                    'records': n,
                }
            }

        # wager win rate factor
        wager_docs = self.firebase.get_latest_wagers(user_id=self.user_id, limit=20)
        wagers = []
        for wager_doc in wager_docs:
            wager_data = wager_doc.to_dict()
            wagers.append(wager_data)

        if len(wagers) > 5:
            wagers_won = [wager for wager in wagers if wager['outcome'] == 'won']
            # wager win rate
            wwr = len(wagers_won) / len(wagers)
            if wwr >= 0.9:
                wwr_adjustment = 5
            elif wwr >= 0.75:
                wwr_adjustment = 3
            elif wwr >= 0.6:
                wwr_adjustment = 2
            elif wwr >= 0.45:
                wwr_adjustment = 1
            else:
                wwr_adjustment = 0

            # win to lose dollars ratio
            won_dollars = 0
            lost_dollars = 0
            for wager in wagers:
                if wager['outcome'] == 'won':
                    won_dollars += wager['payout']
                elif wager['outcome'] == 'lost':
                    lost_dollars += wager['amount']

            if lost_dollars == 0:
                dollars_ratio = 0
            else:
                dollars_ratio = won_dollars / lost_dollars
        else:
            wwr = 0
            wwr_adjustment = 0
            won_dollars = 0
            lost_dollars = 0
            dollars_ratio = 0

        # kd_ratio factor
        profile = await_req(self._get_profile())
        overall_kd_ratio = profile['kd_ratio'] if profile else 0
        recent_kd_ratio = np.mean(np.array(records['kd_ratios']))
        base_kd_ratio = max(overall_kd_ratio, recent_kd_ratio) * 2

        # kills_factor
        mean_kills = np.mean(items)
        median_kills = np.median(items)
        base_kills = max(mean_kills, median_kills)

        # kills_factor + kd_ratio factor + wwr_adjustment
        metadata = {
            'records': n,
            'kills_median': round(base_kills, 2),
            'kd_ratio_2': round(base_kd_ratio, 2),
            'ww_rate': round(wwr, 2),
            'ww_d_ratio': round(dollars_ratio, 2),
            'ww_d_delta': round(won_dollars - lost_dollars, 2),
        }
        print(f"records: {metadata['records']}; median: {metadata['kills_median']}; kd_ratio*2: {metadata['kd_ratio_2']}; ww_rate: {metadata['ww_rate']}")
        p_index = int((max(base_kills, base_kd_ratio))) + 1 + wwr_adjustment

        # odds calculation
        odds = []
        max_acceptable_p = 0.4
        multiplier_ranges = [
            [1.8, 2.2],
            [2.3, 3],
        ]

        items_p = [x/n for x in np.bincount(items)]
        items_cumm_p = [np.sum(items_p[i:]) for i in np.arange(len(items_p))]
        # print(items)
        # print(f'items_p: {items_p}')
        # print(f'items_cumm_p: {items_cumm_p}')

        get_index = [
            lambda x: x,
            lambda x: round(x * 1.5),
        ]

        # generate max of 2 kill odds
        for i in range(2):
            item_index = get_index[i](p_index)
            multiplier_range = multiplier_ranges[i]
            delta_range = multiplier_range[1] - multiplier_range[0]
            max_multiplier = multiplier_range[1]
            cumm_p = get_item(items_cumm_p, item_index, 0)

            win_factor = min((cumm_p / max_acceptable_p), 1) * delta_range
            multiplier = round(max_multiplier - win_factor, 2)

            odds.append({
                '_id': f'kills_{item_index}',
                'name': f'{item_index} Kills',
                'multiplier': multiplier,
                'criteria': {
                    'kills': item_index,
                },
            })
        
        first_odd = get_item(odds, 0, multiplier_ranges[0][1])
        first_kill_count = first_odd['criteria']['kills']
        first_kill_multiplier = first_odd['multiplier']

        second_odd = get_item(odds, 1, multiplier_ranges[1][1])
        second_kill_count = second_odd['criteria']['kills']
        second_kill_multiplier = second_odd['multiplier']

        adjust_top_n = first_kill_count <= 6 and wwr < 0.35
        placement_5_multiplier = round(first_kill_multiplier * 1.2, 2)
        placement_1_multiplier = round(second_kill_multiplier * 1.2, 2)

        if (adjust_top_n):
            placement_5_kill_count = int(first_kill_count / 2)
            placement_1_kill_count = int(first_kill_count / 2)
        elif (wwr < 0.4):
            placement_5_kill_count = int(first_kill_count / 1.5)
            placement_1_kill_count = int(first_kill_count / 1.5)
        elif (wwr < 0.55):
            placement_5_kill_count = first_kill_count
            placement_1_kill_count = first_kill_count
        else:
            placement_5_multiplier = round(second_kill_multiplier * 1.2, 2)
            placement_5_kill_count = second_kill_count
            placement_1_multiplier = round(second_kill_multiplier * 1.4, 2)
            placement_1_kill_count = second_kill_count

        win_odds = [
            # top 5 + N kills
            {
                '_id': f'placement_5_kills_{placement_5_kill_count}',
                'name': f'Top Five, {placement_5_kill_count} Kills or More',
                'multiplier': placement_5_multiplier,
                'criteria': {
                    'kills': placement_5_kill_count,
                    'placement': 5,
                },
            },
            # outright win + N kills
            {
                '_id': f'placement_1_kills_{placement_1_kill_count}',
                'name': f'Outright Win, {placement_1_kill_count} Kills or More',
                'multiplier': placement_1_multiplier,
                'criteria': {
                    'kills': placement_1_kill_count,
                    'placement': 1,
                },
            },
        ]
        
        return {
            'result': odds + win_odds,
            'metadata': metadata,
        }

    
    def _get_kill_records(self, min_kills = 0) -> List[Dict]:
        end_time = 0
        max_records = 50
        records = { 'kills': [], 'kd_ratios': [] }
        prev_match_empty = False
        consecutive_empty = 1
        max_consecutive_empty = 2
        current_page = 0
        max_pages = 5

        def valid_match(match):
            if self.mode == 'br_brsolo':
                mode_matches = True
            elif self.mode == 'br_brduos':
                mode_matches = match['mode'] == 'br_brduos' or match['mode'] == 'br_brtrios'
            elif self.mode == 'br_brtrios':
                mode_matches = match['mode'] == 'br_brduos' or match['mode'] == 'br_brtrios' or match['mode'] == 'br_brquads'
            elif self.mode == 'br_brquads':
                mode_matches = match['mode'] == 'br_brtrios' or match['mode'] == 'br_brquads'
            else:
                mode_matches = match['mode'] == self.mode

            return mode_matches and match['playerStats']['kills'] > min_kills
        
        def get_kills(match):
            player_stats = match['playerStats']
            return int(player_stats.get('kills', 0))
        
        def get_kd_ratio(match):
            player_stats = match['playerStats']
            return int(player_stats.get('kdRatio', 0))

        # stops the loop if:
        # - desired number of records have been collected
        # - hits 2 consecutive empty lists
        # - no matches found
        def continue_search():
            return len(records['kills']) < max_records and (consecutive_empty < max_consecutive_empty or current_page < max_pages)

        while continue_search():
            matches = self.get_matches(end_time=end_time, limit=20)
            if len(matches) == 0:
                break
            end_time = int(matches[-1]['utcStartSeconds']) * 1000
            kills = [get_kills(x) for x in matches if valid_match(x)]
            kd_ratios = [get_kd_ratio(x) for x in matches if valid_match(x)]
            
            current_page += 1
            
            if len(kills) > 0:
                prev_match_empty = False
                records['kills'] += kills
                records['kd_ratios'] += kd_ratios
            else:
                consecutive_empty = consecutive_empty + 1 if prev_match_empty == True else 1
                prev_match_empty = True

        return records


    # get player attributes by id
    async def _get_profile(self) -> Dict:
        res = await self._client.http.GetPlayerProfile(
            self._platform,
            self.username,
            self._title,
            self._mode,
        )

        if not res and not res['data']:
            return None

        profile = res['data']["lifetime"]["mode"]["br"]["properties"]
        wins = profile["wins"]
        kd_ratio = profile["kdRatio"]
        games_played = profile["gamesPlayed"]
        top25 = profile["topTwentyFive"]
        top10 = profile["topTen"]
        top5 = profile["topFive"]
        times_played = profile["timePlayed"]
        kills = profile["kills"]

        return {
            'activision_id': self.activision_id,
            'wins': wins,
            'kd_ratio': kd_ratio,
            'games_played': games_played,
            'wl_ratio': wins / games_played * 100,
            'kills_per_hour': kills / (times_played / (60 * 60)),
            'placed_top25': top25 / games_played * 100,
            'placed_top10': top10 / games_played * 100,
            'placed_top5': top5 / games_played * 100,
            'won_top25': wins / top25 * 100,
            'won_top10': wins / top10 * 100,
            'won_top5': wins / top5 * 100,
        }

