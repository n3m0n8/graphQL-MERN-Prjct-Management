// MONGOOSE CONNECT TO MONGODB 
//const { error } = require('cypress/types/jquery');
//declare instance of a default mongoose schema type
const mongoose = require('mongoose'); 
//mongoose was not connecting so using the MongoClient library instead
//const { MongoClient } = require('mongodb');
//instantiate the actual mongoose object (as a default mongoose schema)
//const mongoose = require('mongoose');
// construct the database connect function which is an async funct.
//const client = new MongoClient(MONGO_API_URI);
const connParams = {
    useNewUrlParser: true ,
    useUnifiedTopology: true,
} 
const dbConn = async ()=> {
    try{
        //try block, create instance of a connection method, drawn from the mongoos default schema's connect() method 
        //pass arg1 of connect() as the MongoDB api details held in environment as a constant.
    const dbConnection = mongoose.connect(process.env.MONGO_API_URI, connParams).then(() => {
        console.log(`connected to database`);
        // issue with connecting to .connect.host property- property returns undefined.
        })
        //.catch((error) =>{
          //  console.log(`Error caught. Details follow: ${error}`)
            //});
    //check connection
    }
    catch (error) {
        console.log(`Error caught. Details follow: ${error}`);
    }
};
//export function to namespaces
module.exports = dbConn;