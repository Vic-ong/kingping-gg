const formatError = (err) => `[START Error]\n${err}\n[END Error]`;

const generalError = (name, err) => formatError(`=== Error getting ${name} doc(s) ===\n${err}`);

const noDocumentError = () => 'No matching documents';

module.exports = {
  generalError,
  noDocumentError,
};
