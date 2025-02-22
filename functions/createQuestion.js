const connectDB = require("./db");

exports.handler = async (event) => {
  try {
    const collection = await connectDB();
    const { question, answers, correctAnswerId, topic } = JSON.parse(event.body);

    if (!question || !Array.isArray(answers) || correctAnswerId === undefined) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid input" }) };
    }

    const result = await collection.insertOne({ question, answers, correctAnswerId, topic });
    return { statusCode: 201, body: JSON.stringify({ id: result.insertedId }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};