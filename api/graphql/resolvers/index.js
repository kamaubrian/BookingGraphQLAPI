const mongoose = require('mongoose');
const Event = require('../../../api/model/event');
const User = require('../../../api/model/user');
const bcyrpt = require('bcryptjs');

const eventHandler = eventIds =>{
    return Event.find({_id: {$in:eventIds}})
        .then(events=>{
            return events.map(singleEvent =>{
                return {
                    ...singleEvent._doc,
                    _id: singleEvent.id,
                    date:new Date(singleEvent._doc.date).toISOString(),
                    creator:user.bind(this, singleEvent.creator)
                }
            })
        })
        .catch(err=>{
            console.log(err.message);
            throw err;
        });
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
                    return {
                        ...event._doc,
                        _id:event.id,
                        date:new Date(event._doc.date).toISOString(),
                        creator:user.bind(this,event._doc.creator)
                    }
                })
            })
            .catch(err=>{
                console.log(err.message);
                throw err;
            })
    },
    createEvent: (args)=>{
        const event = new Event({
            _id:new mongoose.Types.ObjectId(),
            title:args.eventInput.title,
            description:args.eventInput.description,
            price:+args.eventInput.price,
            date:new Date(args.eventInput.date),
            creator:'5c20be57305ea72cf841b022'
        });
        let createdEvent;
        return event.save()
            .then(result=>{
                createdEvent ={...result._doc,
                    _id:result.id,
                    date:new Date(result._doc.date).toISOString(),

                    creator:user.bind(this, result._doc.creator)
                };
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
                    })
            })
            .catch(err=>{
                console.log(err);
                throw err;
            })
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

    }
};