from typing import Dict
from .enums import Verdict

def get_kills(match):
    return int(match['playerStats']['kills'])

def get_placement(match):
    return int(match['playerStats']['teamPlacement'])

def get_scavenger(match):
    scavenger = match['player']['brMissionStats']['missionStatsByType'].get('scavenger')
    return int(scavenger['count']) if scavenger else 0


class Match:
    @staticmethod
    def verdict(match: Dict, bet_data: Dict) -> str:
        checks = bet_data.get('criteria', None)
        lost = Verdict.Lost.value

        for check, check_val in checks.items():
            if (check == 'kills' and get_kills(match) < check_val):
                return lost
            elif (check == 'placement' and get_placement(match) > check_val):
                return lost
            elif (check == 'scavenger' and get_scavenger(match) < check_val):
                return lost

        return Verdict.Won.value

