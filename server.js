//http://localhost:3000/graphql?query={user(id:1){name,friends{id,name}}}

var graphqlHTTP = require('express-graphql')
var express = require('express')

var data = require('./data.json')

import { GraphQLObjectType, GraphQLInt, GraphQLString,  GraphQLList, GraphQLSchema, GraphQLInterfaceType } from 'graphql/type'

const personInterface = new GraphQLInterfaceType({
    name: 'Person',
    description: 'A person',
    fields: () => ({
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        friends: { type: new GraphQLList(personInterface) }
    }),
    resolveType: person => { return userType }
})

const userType = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        friends: {
            type: new GraphQLList(personInterface),
            resolve: user => getUserFriends(user)
        }
    },
    interfaces: [ personInterface ]
})

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        fields: {
            user: {
                type: userType,
                args: {
                    id: { type: GraphQLInt }
                },
                resolve: function (_, args) {
                    return data[args.id]
                }
            }
        }
    })
})

function getUserFriends(user) {
    return user.friends.map(id => getUserById(id))
}

function getUserById(id) {
    return Promise.resolve(data[id])
}

express()
    .use('/graphql', graphqlHTTP({schema: schema, pretty: true}))
    .listen(3000)

console.log('GraphQL server running on http://localhost:3000/graphql')
