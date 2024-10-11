const NodeCache = require('node-cache');
const CACHE_PROVIDER = new NodeCache({ stdTTL: 60 * 60, checkperiod: 120 }); // 1 hour cache

const cachingService = {

  getCacheWithKey: (key) => {
    return CACHE_PROVIDER.get(key);
  },

  setCacheWithKey: (key, value) => {
    CACHE_PROVIDER.set(key, value);
  },

  evictCache: (key) => {
    CACHE_PROVIDER.del(key);
  },
}


module.exports = cachingService;
