const dateFns = require('date-fns')
const bent = require('bent')

const constants = require('./constants')
const logger = require('./local_logger')

const bentJSON = bent('json')

module.exports = {
	Query: {
		actor: () => 'get an actor',
		movie: (parent, { movieTitle: title }, { moviesCollection }) => moviesCollection.findOne({ title }),
		movies: (parent, args, { moviesCollection }) => moviesCollection.find().toArray(),
		upcomingMovies: (parent, args, { moviesCollection }) =>
			moviesCollection.find({ release: { $gt: dateFns.format(new Date(), 'yyyy-MM-dd') } }).toArray(),
		suggestion: (parent, { date: release }, { suggestionsCollection }) => suggestionsCollection.findOne({ release }),
		suggestions: (parent, args, { suggestionsCollection }) => suggestionsCollection.find().toArray(),
	},
	Mutation: {
		addMovie: async (parent, { movieInput }, { moviesCollection }) => {
			const movieInDb = await moviesCollection.findOne({ title: movieInput.title })

			if (movieInDb) {
				throw new Error(`Movie ${movieInput.title} already exist in DB !`)
			}

			const result = await moviesCollection.insertOne(movieInput)

			return result.ops[0]
		},
		addSuggestion: async (parent, { suggestionInput }, { suggestionsCollection }) => {
			const suggestionInDb = await suggestionsCollection.findOne({ movieTitle: suggestionInput.movieTitle })

			if (suggestionInDb) {
				throw new Error(`Suggestion for ${suggestionInput.movieTitle} already exist in DB !`)
			}

			const result = await suggestionsCollection.insertOne({
				created: dateFns.format(new Date(), 'yyyy-MM-dd'),
				...suggestionInput,
			})

			return result.ops[0]
		},
		loadMovies: async (parent, { movieType }, { moviesCollection }) => {
			const { results: moviesFetched } = await bentJSON(
				`${constants.TMDB_API_URL}/${movieType}?language=${constants.language}&region=${constants.region}&api_key=${process.env.TMDB_API_KEY_V3}`,
			)

			const moviesToAdd = await moviesFetched.reduce(async (acc, currentMovie) => {
				const accumulator = await acc

				const movieInDb = await moviesCollection.findOne({ title: currentMovie.title })

				if (!movieInDb) {
					accumulator.push(currentMovie)
				}

				return accumulator
			}, Promise.resolve([]))

			if (!moviesToAdd.length) {
				logger.infoMessageStyle(`No new ${movieType} movies to add`)

				return null
			}

			await Promise.all(
				moviesToAdd.map(movie => {
					moviesCollection.insertOne({
						title: movie.original_title,
						synopsis: movie.overview,
						release: movie.release_date,
						poster: movie.poster_path,
					})
				}),
			)

			return moviesToAdd
		},
	},
}
