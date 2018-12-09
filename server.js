const http = require('http');
const port = process.env.PORT || 3000;
const app = require('./app');

const server = http.createServer(app);

async function createServer(){
    try{
        await server.listen(port);
        console.log('Server Running on Port ',port);
    }catch (e) {
        console.log('Error Creating Server',e.message);
    }
};

createServer();

module.exports = server;