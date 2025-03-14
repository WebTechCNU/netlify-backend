const { ApolloServer, gql } = require("apollo-server-lambda");
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
  type Question {
    id: ID!
    text: String!
    answers: [String!]!
    numberCorrect: Int!
    topic: String
  }

  type Query {
    questions(topic: String, skip: Int, take: Int, sortField: String, sortOrder: String): [Question]
    question(id: ID!): Question
  }

  type Mutation {
    createQuestion(text: String!, answers: [String!]!, numberCorrect: Int!, topic: String): Question
    updateQuestion(id: ID!, text: String, answers: [String!], numberCorrect: Int, topic: String): Question
    deleteQuestion(id: ID!): Boolean
  }
`;

const resolvers = {
    Query: {
        questions: async (_, { topic, skip = 0, take = 10, sortField = "text", sortOrder = "asc" }) => {
            const collection = await connectDB();
            const query = topic ? { topic: new RegExp(topic, "i") } : {};
            const sort = sortField ? { [sortField]: sortOrder === "desc" ? -1 : 1 } : {};

            return await collection.find(query).sort(sort).skip(skip).limit(take).toArray();
        },

        question: async (_, { id }) => {
            const collection = await connectDB();
            return await collection.findOne({ _id: new ObjectId(id) });
        },
    },

    Mutation: {
        createQuestion: async (_, { text, answers, numberCorrect, topic }, { event }) => {
            const user = authenticate(event);
            if (!user) throw new Error("Unauthorized");

            const collection = await connectDB();
            const result = await collection.insertOne({ text, answers, numberCorrect, topic });
            return { id: result.insertedId, text, answers, numberCorrect, topic };
        },

        updateQuestion: async (_, { id, text, answers, numberCorrect, topic }, { event }) => {
            const user = authenticate(event);
            if (!user) throw new Error("Unauthorized");

            const collection = await connectDB();
            const updateFields = {};

            if (text) updateFields.text = text;
            if (answers) updateFields.answers = answers;
            if (numberCorrect !== undefined) updateFields.numberCorrect = numberCorrect;
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

exports.handler = server.createHandler();