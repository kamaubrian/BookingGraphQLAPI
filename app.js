const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./api/routes/index');
const graphQlHttp = require('express-graphql');
const { buildSchema } = require('graphql');



app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());
app.use('/',routes);

app.use('/graphql',graphQlHttp({
    schema:buildSchema(`
        type RootQuery {
            events: [String!]!
        }
        
        type RootMutation {
            createEvent(name: String): String 
        }
    
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue:{
        events: ()=>{
            return [
                'Romantic' ,'Writing Code' ,'Sailing' , 'Code is Fun'
            ];
        },
        createEvent: (args)=>{
            const eventName = args.name;
            return eventName;
        }
    },
    graphiql:true
}));

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