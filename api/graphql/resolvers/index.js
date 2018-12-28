const authResolvers = require('./auth');
const bookingResolvers = require('./booking');
const eventsResolvers = require('./events');

const rootResolver = {
    ...authResolvers,
    ...bookingResolvers,
    ...eventsResolvers
};
module.exports = rootResolver;