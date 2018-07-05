const redis = require('redis');
const mongoose = require('mongoose');
const util = require('util');
const config = require('../config/dev');

const redisUrl = config.redisUrl;

const client = redis.createClient(redisUrl);

client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(option = {}){
    this.useCache = true;
    this.hashKey = option.key || '';
    return this;
}

mongoose.Query.prototype.exec =  async function(){

    if(!this.useCache){
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));

    //Check to see collection exists in redis cache
    // if yes - return it
    const cacheValue = await client.hget(this.hashKey, key);

    if (cacheValue){
        const doc = JSON.parse(cacheValue);
       return Array.isArray(doc)
        ? doc.map(d => new this.model(d))
        : new this.model(doc);
    }
    // if no - then retrive the value from mongodb and cache it

     const result = await exec.apply(this, arguments);
     client.hset(this.hashKey, key, JSON.stringify(result));
     return result;

}

module.exports = {
    clearHash(hashKey) {
      client.del(JSON.stringify(hashKey));
    }
  };