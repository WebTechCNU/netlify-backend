const connectDB = require("./db");
const { ObjectId } = require("mongodb");

exports.handler = async (event) => {
  try {
    const collection = await connectDB();
    const { id } = event.queryStringParameters;
    const { question, answers, correctAnswerId } = JSON.parse(event.body);

    if (!ObjectId.isValid(id)) return { statusCode: 400, body: JSON.stringify({ error: "Invalid ID" }) };

    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { question, answers, correctAnswerId } });

    return result.matchedCount === 0
      ? { statusCode: 404, body: JSON.stringify({ error: "Question not found" }) }
      : { statusCode: 200, body: JSON.stringify({ message: "Updated successfully" }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};