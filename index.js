'use strict'

require('dotenv').config()

const express = require('express')
const { makeExecutableSchema } = require('graphql-tools')
const expressGraphql = require('express-graphql')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

const logger = require('./local_logger')
const types = require('./types')
const resolvers = require('./resolvers')

const app = express()

const dbClient = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true })

const start = async () => {
	await dbClient.connect()
	const db = dbClient.db('L3C_V4')

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

process.on('SIGINT', () => dbClient.close())
process.on('SIGTERM', () => dbClient.close())

start().catch(err => {
	logger.errorMessageStyle('Error when starting project', err)

	process.exit(0)
})
