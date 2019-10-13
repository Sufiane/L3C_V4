const dateFns = require('date-fns')


module.exports = {
	Query: {
		actor: () => 'get an actor',
		movie: (parent, { movieTitle: title }, { moviesCollection }) => moviesCollection.findOne({ title }),
		movies: (parent, args, { moviesCollection }) => moviesCollection.find().toArray(),
		upcomingMovies: (parent, args, { moviesCollection }) => moviesCollection.find({ release: { $gt: dateFns.format(new Date(), 'yyyy-MM-dd') } }).toArray(),
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

			const result = await suggestionsCollection.insertOne({ created: dateFns.format(new Date(), 'yyyy-MM-dd'), ...suggestionInput })

			return result.ops[0]
		},
	},
}
