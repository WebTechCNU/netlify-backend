const connectDB = require("./db");
const { ObjectId } = require("mongodb");

exports.handler = async (event) => {
  try {
    const collection = await connectDB();
    const { id } = event.queryStringParameters;

    if (!ObjectId.isValid(id)) return { statusCode: 400, body: JSON.stringify({ error: "Invalid ID" }) };

    const entity = await collection.findOne({ _id: new ObjectId(id) });

    if (!entity) return { statusCode: 404, body: JSON.stringify({ error: "Question not found" }) };

    return { statusCode: 200, body: JSON.stringify(entity) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};