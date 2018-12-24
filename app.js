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

app.use('/graphql',graphQlHttp({
    schema:buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        
        type User {
            _id: ID!
            email: String!
            password: String
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
         return Event.find()
             .then(events=>{
                 return events.map(event=>{
                     return {
                         ...event._doc,
                        _id:event.id
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
               date:new Date(args.eventInput.date)
           });
            return event.save()
                .then(result=>{
                    console.log(result);
                    return {...result._doc,
                        _id:result.id
                    };
                })
                .catch(err=>{
                    console.log(err);
                    throw err;
                })
        },
        createUser: (args)=>{
            const user = new User({
               email: args.userInput.email,
               password: args.userInput.password
            });
        }
    },
    graphiql:true
}));
app.use('/favicon.ico',()=>{
    console.log("Error")
})

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