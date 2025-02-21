const connectDB = require("./db");
const { ObjectId } = require("mongodb");

exports.handler = async (event) => {
  try {
    const collection = await connectDB();
    const { id } = event.queryStringParameters;

    if (!ObjectId.isValid(id)) return { statusCode: 400, body: JSON.stringify({ error: "Invalid ID" }) };

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    return result.deletedCount === 0
      ? { statusCode: 404, body: JSON.stringify({ error: "Question not found" }) }
      : { statusCode: 200, body: JSON.stringify({ message: "Deleted successfully" }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};