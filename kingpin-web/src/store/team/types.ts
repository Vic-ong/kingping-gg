export interface Team {
  _id: string;
  count: number;
  max: number;
  name: string;
  userIds: string[];
  [key: string]: string[] | string | number;
}

export interface TeamData {
  _id: string;
  name: string;
  count: number;
  max: number;
  members: string[];
}

export interface TeamsDataState {
  loading: boolean;
  error: boolean;
  data?: Team[];
  [key: number]: Team;
}

export interface TeamDataState {
  loading: boolean;
  error: boolean;
  data?: TeamData;
  [key: number]: Team;
}

export interface TeamState {
  teams: TeamsDataState;
  team: TeamDataState;
}
