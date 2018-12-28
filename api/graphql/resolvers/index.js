const mongoose = require('mongoose');
const Event = require('../../../api/model/event');
const User = require('../../../api/model/user');
const bcyrpt = require('bcryptjs');
const Booking = require('../../../api/model/booking');
const {dateToString} = require('../helpers/date');

const transformEvent = event => {
    return {
        ...event._doc,
        _id: event.id,
        date: dateToString(event._doc.date),
        creator: user.bind(this,event.creator)
    };
};

const transformBooking = async booking => {
    return {
        ...booking._doc,
        _id: booking.id,
        user: user.bind(this, booking._doc.user),
        event: await singleEventHandler.bind(this, booking._doc.event),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt)
    }
};

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
    bookings: async ()=>{
      try{
        const bookings = await Booking.find();
        console.log(bookings);
        return bookings.map( async booking => {
            return await transformBooking(booking);
        })
      }catch (e) {
          console.log(e.message);
          throw e;
      }
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
    },
    createUser: (args)=>{
        return User.findOne({email:args.userInput.email})
            .then(user=>{
                if(user){
                    throw new Error('User Already Exists')
                }else{
                    return bcyrpt.hash(args.userInput.password,12)
                        .then(hashedPassword => {
                            const user = new User({
                                email: args.userInput.email,
                                password: hashedPassword
                            });
                            return user.save()
                                .then(result=>{
                                    return{
                                        ...result._doc,_id:result.id,
                                        password:null
                                    }
                                })
                                .catch(err=>{
                                    console.log(err.message);
                                    throw err;
                                });
                        })
                        .catch(err=>{
                            console.log(err.message);
                            throw err;

                        });
                }
            })
            .catch(err=>{
                console.log('Error Fetching Users',err.message);
                throw err;
            })

    },
    bookEvent: async(args)=>{
        try{
            const fetchedEvent = await Event.findOne({_id: args.eventId});
            const singleBooking = new Booking({
                user:'5c20be57305ea72cf841b022',
                event:fetchedEvent
            });
            const result = await singleBooking.save();
            return transformBooking(result);
        }catch (e) {
            console.log(e.message);
            throw e;
        }
    },
    cancelBooking: async(args)=>{
        try{
            const bookedEvent = await Booking.findById(args.bookingId).populate('event');
            if(bookedEvent == null ){
                throw new Error("Booking Does not Exist");
            }
            const event =transformEvent(bookedEvent.event);
            await Booking.deleteOne({_id:args.bookingId});
            return event;
        }catch (e) {
            console.log(e.message);
            throw e;
        }
    }
};