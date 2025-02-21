const connectDB = require("./db");

exports.handler = async (event) => {
  try {
    const collection = await connectDB();
    const { text, answers, numberCorrect, topic } = JSON.parse(event.body);

    if (!text || !Array.isArray(answers) || numberCorrect === undefined) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid input" }) };
    }

    const result = await collection.insertOne({ text, answers, numberCorrect, topic });
    return { statusCode: 201, body: JSON.stringify({ id: result.insertedId }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};