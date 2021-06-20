const projectId = process.env.VUE_APP_FIREBASE_PROJECT_ID;
const region = process.env.VUE_APP_GCF_REGION;

export default {
  baseUrl: `https://${region}-${projectId}.cloudfunctions.net`,
};
