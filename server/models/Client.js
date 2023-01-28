// instantiate a Mongoose schema object from builtin Schema class
const mongoose = require('mongoose');
// assign custom object ClientSchema as such an instance with following attributes modelled to it: name (string), emial (str), phone (str)
const ClientSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
});

//export this custom schema out to the environment.
module.exports = mongoose.model('Client', ClientSchema);