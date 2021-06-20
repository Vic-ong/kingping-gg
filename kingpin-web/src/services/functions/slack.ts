import axios from 'axios';
import config from './gcfConfig';

const { baseUrl } = config;

export const sendSlackMsg = (message: string, source: string) => {
  const formattedMsg = `Error occurred in ${source}:\`\`\`${message}\`\`\``;

  return axios.post(`${baseUrl}/send_slack_message`, { message: formattedMsg });
};

export default sendSlackMsg;
