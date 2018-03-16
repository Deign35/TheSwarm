const config = require('../screeps.json');
// Please set the configuration below
module.exports = {
    screeps: {
        token: config.token,
        method: 'memory.stats', // Valid Options: 'console' 'memory.stats'
        segment: 0,
        //		segment: 99, // Uncomment this line and specify segment id if you're placing stats into segment
        shard: ['shard2'], // An array of shards to pull data from.
    },
    service: {
        url: 'https://screepspl.us',
        token: config.screepsPlusToken	// Token supplied upon account creation
    },
    checkForUpdates: true,
    showRawStats: false, // This dumps stats to console on every push if enabled
}