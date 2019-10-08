'use strict'

require('dotenv').config()

const express = require('express')
const { makeExecutableSchema } = require('graphql-tools')
const expressGraphql = require('express-graphql')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

const logger = require('./local_logger')
const types = require('./types')

const app = express()

const start = async () => {
	const dbClient = await MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true })
	const db = dbClient.db('L3C_V4')

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

	const executableSchema = makeExecutableSchema({ typeDefs: types, resolvers })

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
	logger.infoMessageStyle('[START] L3C_V4 now up at localhost:7777/graphql')
})

process.on('unhandledRejection', err => {
	logger.errorMessageStyle('UnhandledRejection error', err)

	process.exit(0)
})

start().catch(err => {
	logger.errorMessageStyle('Error when starting project', err)

	process.exit(0)
})
