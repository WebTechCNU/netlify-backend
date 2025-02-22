const connectDB = require("./db");

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

  try {
    const collection = await connectDB();
    const { question, answers, correctAnswerId, topic } = JSON.parse(event.body);

    if (!question || !Array.isArray(answers) || correctAnswerId === undefined) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid input" }) };
    }

    const result = await collection.insertOne({ question, answers, correctAnswerId, topic });
    return { statusCode: 201, 
      headers: {
        "Access-Control-Allow-Origin": "*",  // Allow all origins (change to specific domain in future)
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }, 
      body: JSON.stringify({ id: result.insertedId }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};