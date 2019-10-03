'use strict'

const { GraphQLScalarType, Kind } = require('graphql')
const joi = require('joi')

const dateParser = date => {
	joi.assert(date, joi.date().iso(), 'Date was not formatted correctly, valid format: YYYY-MM-DD.')

	return date
}

exports.Date = new GraphQLScalarType({
	name: 'Date',
	description: 'Date formatted as follow YYYY-MM-DD',
	serialize: dateParser,
	parseValue: dateParser,
	parseLiteral: ({ kind, value }) => {
		if (kind !== Kind.STRING) {
			throw new Error('Date must be a string with following format: YYYY-MM-DD.')
		}

		return dateParser(value)
	},
})
