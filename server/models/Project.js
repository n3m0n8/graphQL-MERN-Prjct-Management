// instantiate a Mongoose schema object from builtin Schema class
const mongoose = require('mongoose');
// assign custom object ClientSchema as such an instance with following attributes modelled to it: name (string), description (str), status (str)
const ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        enum: ['new','ongoing','complete'],
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
    }
});

//export this custom schema out to the environment.
module.exports = mongoose.model('Project', ProjectSchema);