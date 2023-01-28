//////COMPILE\\\\\\\\\\\
const express  = require('express');
//const { listen } = require('express/lib/application');
const colors = require('colors');
const cors = require('cors');
require('dotenv').config();
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema');
const dbConn = require('./config/db');
const port = process.env.PORT || 4000;
const app = express();
///////////RUNTIME\\\\\\\\\\\\\\\
dbConn();
//app.get('/', (req, res)=>{
  // this is incorrect... this would be a static render  using a views engine like handlebars or pug.
  //res.render('../client/public/index');
//});
app.use(cors())
// app.use(express.static(__dirname + '/client/public/index.html'));
//app.get('/', function(req, res){
  //res.send('root');
//});
//app.use() is for middlware injection for every calls to get a request/response object 
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: process.env.NODE_ENV === 'development',
}));
app.listen(port, console.log(`server up on ${port}`));

