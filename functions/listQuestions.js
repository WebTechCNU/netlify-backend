const connectDB = require("./db");

exports.handler = async (event) => {
  try {
    const collection = await connectDB();
    const { search, sortField, sortOrder = "asc" } = event.queryStringParameters;

    const query = search ? { text: new RegExp(search, "i") } : {};
    const sort = sortField ? { [sortField]: sortOrder === "desc" ? -1 : 1 } : {};

    const questions = await collection.find(query).sort(sort).toArray();

    return { 
      statusCode: 200, 
      headers: {
        "Access-Control-Allow-Origin": "*",  // Allow all origins (change to specific domain if needed)
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify(questions) };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) };
  }
};