import axios from 'axios';
import { PlatformId } from '@/store/profile/types';
import { camelToSnakeObject } from '@/utils/formats';
import config from './gcfConfig';
import { sendSlackMsg } from './slack';

const { baseUrl } = config;

const isDev = process.env.NODE_ENV === 'development';
const url = isDev ? 'http://localhost:5001/kingpin-gg/us-central1' : baseUrl;

interface ValidateUsersProps {
  usernames: {
    platform: string;
    username: string;
  }[];
}

export const validateUsers = async (params: ValidateUsersProps) => {
  try {
    const { usernames } = params;
    const res = await axios.post(`${url}/api/validateCodUsers`, { usernames });
    return res.data.result;
  } catch (err) {
    console.error(err);
    sendSlackMsg(`message: ${err.message || err}\nparams: ${JSON.stringify(params)}`, 'function/validateUsers');
    throw err;
  }
};

interface GetBettingOdds {
  userId: string;
  activisionId: string;
  platformId: PlatformId;
  mode: string;
}

export const getBettingOdds = (params: GetBettingOdds) => {
  try {
    const formattedParams = camelToSnakeObject(params);
    return axios.post(`${baseUrl}/betting_odds`, formattedParams);
  } catch (err) {
    sendSlackMsg(`message: ${err.message || err}\nparams: ${JSON.stringify(params)}`, 'function/getBettingOdds');
    throw err;
  }
};

export default validateUsers;
