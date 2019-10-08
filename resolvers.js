module.exports = {
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
