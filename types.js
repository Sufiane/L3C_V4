module.exports = `

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
appearsIn: [Movie]!
}

type Director {
identity: Identity!
directed: [Movie]!
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
