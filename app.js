const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./api/routes/index');
const graphQlHttp = require('express-graphql');
require('dotenv').config();
const events = [];
const mongoose = require('mongoose');
const graphqlResolvers = require('./api/graphql/resolvers/index');
const graphqlSchemas = require('./api/graphql/schemas/index');


mongoose.connect("mongodb+srv://" + process.env.MONGO_ATLAS_USER + ":" + process.env.MONGO_ATLAS + "@restapi-kvyex.mongodb.net/" + process.env.MONGO_ATLAS_DATABASE + "?retryWrites=true",
    {useNewUrlParser: true}, function (err) {
        if (!err) {
            console.log('Successful Connection to MongoDB');
        } else {
            console.log('Error Loading Connection', err.message);
        }
    });

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());
app.use('/', routes);


app.use('/graphql', graphQlHttp({
    schema: graphqlSchemas,
    rootValue: graphqlResolvers,
    graphiql: true
}));

app.use('/favicon.ico', () => {
    console.log("Error")
});

app.use(function (req, res, next) {
    const error = new Error('Route Not Found');
    error.status = 404;
    next(error);

});
app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.json({
        err: {
            message: err.message
        }
    })
});

module.exports = app;