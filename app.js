const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./api/routes/index');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());
app.use('/',routes);

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