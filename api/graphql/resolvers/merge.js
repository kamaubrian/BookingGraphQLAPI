const User = require('../../model/user');
const Event  = require('../../model/event');

const eventHandler = eventIds =>{
    return Event.find({_id: {$in:eventIds}})
        .then(events=>{
            return events.map(singleEvent =>{
                return transformEvent(singleEvent);
            });
        })
        .catch(err=>{
            console.log(err.message);
            throw err;
        });
};

const singleEventHandler = async (eventId)=>{
    try{
        const fetchedEvent = await Event.findById(eventId);
        console.log(fetchedEvent);
        return transformEvent(fetchedEvent);
    }catch (e) {
        console.log('Error Fetching single Event',e.message);
        throw e;
    }
};


const user = userId =>{
    return User.findById(userId)
        .then(user=>{
            return {
                ...user._doc,
                _id:user.id,
                createdEvents: eventHandler.bind(this,user._doc.createdEvents)
            }
        })
        .catch(err=>{
            console.log(err.message);
            throw err;
        })
};

exports.user = user;
exports.singleEventHandler = singleEventHandler;
exports.events = eventHandler;