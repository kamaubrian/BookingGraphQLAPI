const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./api/routes/index');
const graphQlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
require('dotenv').config();
const events  = [];
const mongoose = require('mongoose');
const Event = require('./api/model/event');
const User = require('./api/model/user');
const bcyrpt = require('bcryptjs');


mongoose.connect("mongodb+srv://"+process.env.MONGO_ATLAS_USER+":"+process.env.MONGO_ATLAS+"@restapi-kvyex.mongodb.net/"+process.env.MONGO_ATLAS_DATABASE+"?retryWrites=true",
    {useNewUrlParser:true},function(err){
        if(!err){
            console.log('Successful Connection to MongoDB');
        }else{
            console.log('Error Loading Connection',err.message);
        }
    });

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());
app.use('/',routes);

const user = userId =>{
    return User.findById(userId)
        .then(user=>{
           return {
               ...user._doc,_id:user.id
           }
        })
        .catch(err=>{
            console.log(err.message);
            throw err;
        })
};

app.use('/graphql',graphQlHttp({
    schema:buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: User!

        }
        
        type User {
            _id: ID!
            email: String!
            password: String
            createdEvents: [Event!]
        }
     
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        
        input UserInput {
            email: String!
            password: String!
        }
        
        type RootQuery {
            events: [Event!]!
        }
        
        type RootMutation {
            createEvent(eventInput: EventInput): Event 
            createUser(userInput: UserInput): User
        }
    
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue:{
        events: ()=>{
         return Event.find().populate('creator')
             .then(events=>{
                 return events.map(event=>{
                     return {
                         ...event._doc,
                        _id:event.id,
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
                        _id:result.id
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
    },
    graphiql:true
}));

app.use('/favicon.ico',()=>{
    console.log("Error")
});

app.use(function(req,res,next){
   const error = new Error('Route Not Found');
   error.status = 404;
   next(error);

});
app.use(function(err,req,res){
   res.status(err.status || 500);
   res.json({
       err:{
           message:err.message
       }
   })
});

module.exports = app;