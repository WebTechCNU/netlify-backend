const connectDB = require("./db");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Change to frontend domain in future
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  const token = event.headers.authorization?.split(" ")[1];
  const secretKey = process.env.JWT_SECRET;

  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized: No token provided" }) };
  }

  try {
    jwt.verify(token, secretKey);
  } catch (error) {
    return { statusCode: 403, body: JSON.stringify({ error: "Forbidden: Invalid token" }) };
  }

  try {
    const collection = await connectDB();
    const { id } = event.queryStringParameters;
    const { question, answers, correctAnswerId } = JSON.parse(event.body);

    if (!ObjectId.isValid(id)) return { statusCode: 400, body: JSON.stringify({ error: "Invalid ID" }) };

    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { question, answers, correctAnswerId } });

    return result.matchedCount === 0
      ? { statusCode: 404, 
        headers: {
          "Access-Control-Allow-Origin": "*",  // Allow all origins (change to specific domain in future)
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }, body: JSON.stringify({ error: "Question not found" }) }
      : { statusCode: 200, 
        headers: {
          "Access-Control-Allow-Origin": "*",  // Allow all origins (change to specific domain in future)
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }, body: JSON.stringify({ message: "Updated successfully" }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};