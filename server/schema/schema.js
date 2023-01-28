// import our good ol' js array with its objects:
//const { projects, clients } = require('../sampleData.js')

//import the Project and Client mongoose models into the database schema. The schema acts as a roadmap for fitting server.js actions into the MongoDB database via mongoose 
const Project = require('../models/Project');
const Client = require('../models/Client');

//import graphql library and simultaneously specify the GraphQLObjectType and other classes from the library and pick out these classes in assignment via object destructuring
const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLSchema, GraphQLList, GraphQLNonNull, GraphQLEnumType } = require('graphql');
// assign our object values to these graphql types
    //PROJECT graphql const 
    // this maps the imported mongoose shcema object into a GraphQL object via the GraphQLObjectType() method.  
    const ProjectType = new GraphQLObjectType({
        // we assign a name to this GraphQLObject that maps directly on the name that was given to the Mongoose schema model in the export statement at the end of the Project.js namespace:
        name: 'Project',
        // assign the fields to be mapped from the GraphQLObject onto the MongoDB record: 
        fields: () => ({
            //assign GraphQL types 
            id: { type: GraphQLID },
            name: { type: GraphQLString },
            //clientId: { type: GraphQLString }, ?? 
            description: { type: GraphQLString },
            status: { type: GraphQLString },
    //make an inter-relationship to the client type here
            client: {
            type: ClientType,
            resolve(parent, args){
                //note here the hits matching against Parent id is what the query is returning i.e. projects is the parent, so that whatever the projects id is, i want a corresponding client.
                //old construct
                //return clients.find(client => client.id === parent.id);    
                //new construct exploits the inbuilt findbyId meth that comes with the Mongoose default schema:
                return Client.findOne(parent.clientId);
                },
            },
        }),
    });
    //CLIENT graphql const
    const ClientType = new GraphQLObjectType({
        name: 'Client',
        fields: () => ({
            id: { type: GraphQLID },
            name: { type: GraphQLString },
            email: { type: GraphQLString },
            phone: { type: GraphQLString },
            }),
        });
// assigned query consts to graphqlobj types.
const RootQuery = new GraphQLObjectType ({
    name: 'RootQueryType',
    fields: {
        //return full list of projects objects encapsulated under projects graphql type above.
        projects: {
            type: new GraphQLList(ProjectType),
            resolve(parent, args){
                //older construct:
                //return projects.find(project => project.id === args.id); 
                //with this construct, we directly reference the ProjectSchema custom schema which is named 'Project' using mongoose.model() method
                //new construct using inbuilt find method in the mongoose default schema (whatever query needs is passed as the args in the resolve function hence use of generic find() ):  
                return Project.find();
            },
        },
        project: {
            //first scope out relevant type of data being sought
            type: ProjectType,
            // in this case we want specific hit so we create a 'primary key' focussed query 'string' based on id:
            args: { id: {type : GraphQLID} },
            //finally, provide resolve construct for runtime excution of that query if it's called upon (a promise being resolved)
            resolve(parent, args){
                //in this case we use the more specific findbyid()
                return Project.findById(args.id);
            },
        },
        clients: {
            type: new GraphQLList(ClientType),
            resolve(parent, args){
                //same as project... generic return
                return Client.find();
            },
        },
        client: { 
            type: ClientType,
            args: { id: { type: GraphQLID} },
            resolve(parent, args) {
                //old construct
                //return clients.find(client => client.id === args.id);
                //new construct using inbuilt findbyid method in the mongoose default schema (id is passed as the args in the resolve function):  
                return Client.findOne(args.id);
            },
        },
    },
});
//// MUTATIONS\\\\
const mutation = new GraphQLObjectType({
    name: 'Mutation', 
    fields: {
        //CLIENT MUTATIONS FIRST
        //create record
        addClient: {
            //set the GraphQL type
            type: ClientType,
            args: {
                //set the GraphQL object name
                name: { type: new GraphQLNonNull(GraphQLString) },
                // set the GraphQl object email address                
                email: { type: new GraphQLNonNull(GraphQLString)},
                // set the GraphQL object phone number
                phone: { type: new GraphQLNonNull(GraphQLString)},
            },
            // resolve insert action on basis of inputs
            resolve(parent, args){
                const client = new Client({
                    name: args.name,
                    email: args.email,
                    phone: args.phone,
                });
                return client.save();
            },
        },
        // delete mutation 
        deleteClient: {
            type: ClientType,
            args: {
                // find a GraphQL object by id
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args){
                // here we add a search for any related projects so as to simultaneously delete any projects this client is attached to upon delete that project
                Project.find({ clientId: args.id }).then((projects) => {
                    projects.forEach(project=>{
                        project.remove();
                    });
                });

                //deletes the client
                return Client.findByIdAndRemove(args.id);
            }
        },
        //PROJECTS MUTATIONS
        // Add Project
        addProject: {
            //set the GraphQL type
            type: ProjectType,
            //set the model-based args for filling the object's props
            args: {
                // set project name
                name: { type: new GraphQLNonNull(GraphQLString) },
                // set project descr 
                description: { type: new GraphQLNonNull(GraphQLString) }, 
                // set project status by encapsulating the enum options within a javascript object with each option nested:
                status: {
                    type: new GraphQLEnumType({
                        name: 'ProjectStatus',
                        values: {
                            'new': { value : 'new' },
                            'ongoing': { value: 'ongoing' },
                            'complete': { value: 'complete' },
                        }
                    }),
                        //set the default as new:
                        defaultValue: 'new', 
                }, 
                clientId: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve(parent, args){
                const project = new Project({
                    name: args.name,
                    description: args.description,
                    status: args.status,
                    clientId: args.clientId,
                });
                return project.save();
            },
        },
        //delete project
        deleteProject: {
            type: ProjectType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve(parent, args){
                return Project.findByIdAndRemove(args.id);
            },
        },
        // update project 
        updateProject: {
            type: ProjectType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                // no non-null for name here because there is only an update to existing record, no entry that could be null.
                name: { type: GraphQLString },
                description: { type: GraphQLString },
                status: {
                    type: new GraphQLEnumType({
                        //name has to be unique since we are creating a type for updating, not creating
                        name: 'ProjectStatusUpdate',
                        values: {
                            'new': { value : 'new' },
                            'ongoing': { value: 'ongoing' },
                            'complete': { value: 'complete' },
                        }
                    }),
                }, 
                //no need for clientID here since it is used in the args above
            },
            resolve(parent, args){
                //in this case we use find and update:
                return Project.findByIdAndUpdate(
                    args.id,
                        {
                        // MONGODB $SET - replaces the value of a given field
                            $set: {
                                name: args.name,
                                description: args.description, 
                                status: args.status,
                            },
                        },
                        { new : true }
                );
            }
        },
    //FIELDS CLOSE BRACKET    
    },
// MUTATIONS CLOSE BRACKET
});
//export module for external use
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation,
});