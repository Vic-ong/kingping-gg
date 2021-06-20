const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const slackToken = process.env.SLACK_API_TOKEN;

const postMessage = async (channel, text) => {
  const url = 'https://slack.com/api/chat.postMessage';
  const res = await axios.post(
    url,
    {
      channel,
      text,
    },
    { headers: { authorization: `Bearer ${slackToken}` } },
  );

  return res.data;
};

module.exports = {
  postMessage,
};
