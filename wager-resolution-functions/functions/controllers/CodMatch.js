const codApi = require('call-of-duty-api')();
const ServiceCredentials = require('@/models/ServiceCredentials');

const login = async () => {
  const credential = await ServiceCredentials.getActiveCredential();
  await codApi.login(credential.email, credential.password);
};

const getPlayerName = (activisionId) => {
  const hashIndex = activisionId.lastIndexOf('#');
  return hashIndex === -1 ? activisionId : activisionId.substring(0, hashIndex);
};

const findFullMatch = async (id, platformId, activisionId) => {
  await login();
  const { platform } = platformId;
  const fullMatch = await codApi.MWFullMatchInfowz(id, codApi.platforms[platform]);
  const matchData = activisionId
    ? fullMatch.allPlayers.find((match) => match.player.username === getPlayerName(activisionId))
    : fullMatch.allPlayers;

  return {
    status: 200,
    body: {
      result: matchData,
    },
  };
};

const findUserMatch = async ({ user, startTime, endTime }) => {
  await login();
  try {
    const { platform, username } = user.platformId;
    const matchDetails = await codApi.MWcombatwzdate(username, startTime, endTime, codApi.platforms[platform]);
    if (!matchDetails || !matchDetails.matches) return undefined;

    return matchDetails.matches;
  } catch (err) {
    if (err === 'Incorrect username or platform') return undefined;
    throw err;
  }
};

const findClosestMatch = async ({ wager, partition, allPlayers = false }) => {
  const { user, mode } = wager;
  const { platformId } = user;
  const { startTime, endTime } = partition;

  // find the closest match
  const matches = await findUserMatch({ user, startTime, endTime });
  if (!matches) return undefined;

  const filteredMatches = matches.filter((match) => {
    const minTime = startTime / 1000;
    const maxTime = startTime / 1000 + 5 * 60;
    const withinPartition = match.utcStartSeconds > minTime && match.utcStartSeconds < maxTime;
    const modeMatches = match.mode === mode;
    return withinPartition && modeMatches;
  });

  if (filteredMatches.length === 0) return undefined;

  const closestMatch = filteredMatches.reduce((match, curr) => {
    return curr.utcStartSeconds < match.utcStartSeconds ? curr : match;
  });

  // returns the match info of the user/player
  if (!allPlayers) return closestMatch;

  // get the match info for all players
  const { matchID } = closestMatch;
  const fullMatch = await codApi.MWFullMatchInfowz(matchID, codApi.platforms[platformId.platform]);
  return {
    matchID,
    ...fullMatch,
  };
};

module.exports = {
  findFullMatch,
  findUserMatch,
  findClosestMatch,
};
