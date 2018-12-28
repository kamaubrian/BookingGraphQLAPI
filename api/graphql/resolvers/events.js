const Event = require('../../../api/model/event');
const {dateToString} = require('../helpers/date');
const User = require('../../../api/model/user');
const mongoose = require('mongoose');
const {user} = require('./merge');

const transformEvent = event => {
    return {
        ...event._doc,
        _id: event.id,
        date: dateToString(event._doc.date),
        creator: user.bind(this,event.creator)
    };
};


module.exports = {
    events: ()=>{
        return Event.find().populate('creator')
            .then(events=>{
                return events.map(event=>{
                    return transformEvent(event);
                })
            })
            .catch(err=>{
                console.log(err.message);
                throw err;
            });
    },
    createEvent: (args)=>{
        const event = new Event({
            _id:new mongoose.Types.ObjectId(),
            title:args.eventInput.title,
            description:args.eventInput.description,
            price:+args.eventInput.price,
            date:dateToString(args.eventInput.date),
            creator:'5c20be57305ea72cf841b022'
        });
        let createdEvent;
        return event.save()
            .then(result=>{
                createdEvent =transformEvent(result);
                return User.findById('5c20be57305ea72cf841b022')
                    .then(user=>{
                        if(!user){
                            throw new Error('User Not Found')
                        }
                        user.createdEvents.push(event);
                        return user.save()
                            .then(result=>{
                                return createdEvent;
                            })
                            .catch(err=>{
                                throw err;
                            });
                    })
                    .catch(err=>{
                        throw err;
                    });
            })
            .catch(err=>{
                console.log(err);
                throw err;
            });
    }
};