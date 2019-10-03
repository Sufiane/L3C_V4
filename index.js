'use strict'

require('dotenv').config()

const express = require('express')
const { buildSchema } = require('graphql')
const { makeExecutableSchema } = require('graphql-tools')
const expressGraphql = require('express-graphql')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

const app = express()
//const dbClient = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true });

const start = async () => {
	const dbClient = await MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true })
	const db = dbClient.db('L3C_V4')

	// TODO: move this to a separate file
	const type = `

  scalar Date

  enum Genre {
    Action
    Adventure
    Biographical
    Catastrophic
    Comedic
    Drama
    Spy
    Fantastic
    Historical
    Horror
    Peplum
    Polar
    Scy_fy
    Thriller
    Western
  }
  
  type Identity {
    name: String!
    dateOfBirth: Date
    country: String
  }

  type Actor {
    identity: Identity!
    appearsIn: [String]! # replace String by Movie type
  }
  
  type Director {
    identity: Identity!
    directed: [String]! # replace String by Movie type
  }
  
  type Movie {
  	title: String!
    director: Director!
    actors: [Actor!]!
    release: Date!
    synopsis: String!
    genres: [Genre!]!
    note: Int
    trailer: String
    length: Int
    poster: String
  }

  type Suggestion {
    created: Date!
    release: Date!
    movie: Movie!
    reason: String!
  }


  type Query {
    actor: Actor
    movie(movieTitle: String!): Movie
    suggestion(date: Date!): Suggestion
  }
  
  type Mutation {
  	movies: [Movie]!
  	suggestions: [Suggestion]!
  }
`
	const schema = buildSchema(type)

	// TODO: investigate this more (i guess its the root resolver)
	const resolvers = {
		Query: {
			actor: () => 'get an actor',
			movie: async (parent, { movieTitle: title }, { moviesCollection }) => moviesCollection.findOne({ title }),
			suggestion: (parent, { date: release }, { suggestionsCollection }) => suggestionsCollection.findOne({ release }),
		},
		Mutation: {
			movies: (parent, args, { moviesCollection }) => moviesCollection.find().toArray(),
			suggestions: (parent, args, { suggestionsCollection }) => suggestionsCollection.find().toArray(),
		},
	}

	const executableSchema = makeExecutableSchema({ typeDefs: type, resolvers })

	app.use(
		'/graphql',
		bodyParser.json(),
		expressGraphql({
			schema: executableSchema,
			context: {
				suggestionsCollection: db.collection('Suggestions'),
				moviesCollection: db.collection('Movies'),
			},
			graphiql: true,
		}),
	)
}

app.listen(7777, () => {
	console.log('[START] L3C_V4 now up at localhost:7777/graphql')
})

process.on('unhandledRejection', err => {
	console.log('ERROOOOOOOOOOOOOOOOOOOR', err)

	process.exit(0)
})

start().catch(err => {
	console.log('ERROR ON START', err)

	process.exit(0)
})
