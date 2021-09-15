const formatMessage = (username, text) => {
  const today = new Date();
  return {
    username,
    text,
    time: `${today.getHours()}:${today.getMinutes()}`,
  };
};

module.exports = {
  formatMessage,
};
