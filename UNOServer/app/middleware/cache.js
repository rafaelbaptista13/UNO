const NodeCache = require('node-cache');
const cache = new NodeCache({ maxSize: 100 * 1024 * 1024, stdTTL: 24 * 60 * 60});

module.exports = cache;