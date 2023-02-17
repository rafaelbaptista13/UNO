module.exports = {
  secret: "uno-secret-key-this-must-be-random",
  // jwtExpiration: 3600, // 1 hour
  // jwtRefreshExpiration: 86400, // 24 hour

  /* for test */
  jwtExpiration: 10,          // 1 minute
  jwtRefreshExpiration: 1200,  // 2 minutes
};
