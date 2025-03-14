// const { ApolloServer, gql } = require("apollo-server-lambda");
const { ApolloServer, gql } = require("apollo-server-express");
const express = require("express");
const serverless = require("serverless-http");
const connectDB = require("./db");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;

const verifyToken = (token) => {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        return null;
    }
}

const authenticate = (event) => {
    const authHeader = event.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    return verifyToken(token);
};

const typeDefs = gql`
  type QuestionInterview {
    id: ID!
    question: String!
    answers: [String!]!
    correctAnswerId: Int!
    topic: String
  }

  type Query {
    questions(topic: String, skip: Int, take: Int, sortField: String, sortOrder: String): [QuestionInterview]
    questionInterview(id: ID!): QuestionInterview
  }

  type Mutation {
    createQuestion(question: String!, answers: [String!]!, correctAnswerId: Int!, topic: String): QuestionInterview
    updateQuestion(id: ID!, question: String, answers: [String!], correctAnswerId: Int, topic: String): QuestionInterview
    deleteQuestion(id: ID!): Boolean
  }
`;

const resolvers = {
    Query: {
        questions: async (_, { topic, skip = 0, take = 10, sortField = "question", sortOrder = "asc" }) => {
            const collection = await connectDB();
            const query = topic ? { topic: new RegExp(topic, "i") } : {};
            const sort = sortField ? { [sortField]: sortOrder === "desc" ? -1 : 1 } : {};

            return await collection.find(query).sort(sort).skip(skip).limit(take).toArray();
        },

        questionInterview: async (_, { id }) => {
            const collection = await connectDB();
            return await collection.findOne({ _id: new ObjectId(id) });
        },
    },

    Mutation: {
        createQuestion: async (_, { question, answers, correctAnswerId, topic }, { event }) => {
            const user = authenticate(event);
            if (!user) throw new Error("Unauthorized");

            const collection = await connectDB();
            const result = await collection.insertOne({ question, answers, correctAnswerId, topic });
            return { id: result.insertedId, question, answers, correctAnswerId, topic };
        },

        updateQuestion: async (_, { id, question, answers, correctAnswerId, topic }, { event }) => {
            const user = authenticate(event);
            if (!user) throw new Error("Unauthorized");

            const collection = await connectDB();
            const updateFields = {};

            if (question) updateFields.question = question;
            if (answers) updateFields.answers = answers;
            if (correctAnswerId !== undefined) updateFields.correctAnswerId = correctAnswerId;
            if (topic) updateFields.topic = topic;

            await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });
            return { id, ...updateFields };
        },

        deleteQuestion: async (_, { id }, { event }) => {
            const user = authenticate(event);
            if (!user) throw new Error("Unauthorized");

            const collection = await connectDB();
            const result = await collection.deleteOne({ _id: new ObjectId(id) });
            return result.deletedCount > 0;
        },
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ event }) => ({ event }), // pass request event to resolvers
});

const app = express();
server.applyMiddleware({ app });

exports.handler = serverless(app);

// exports.handler = server.createHandler({
//     expressGetMiddlewareOptions: {
//         cors: {
//             origin: "*",
//             credentials: true,
//         },
//     },
// });