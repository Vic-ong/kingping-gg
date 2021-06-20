from enum import Enum

class WagerOutcome(Enum):
    Invalid = 'invalid'
    Pending = 'pending'
    Won = 'won'
    Lost = 'lost'

class WagerMode(Enum):
    Solos = 'solos'
    Duos = 'duos'
    Trios = 'trios'
    Quads = 'quads'

class WagerStatus(Enum):
    UserConcedeDefeat = 'user_concede_defeat'
    NoMatchesFound = 'no_matches_found'
    NoStatus = ''
