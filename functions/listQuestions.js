const connectDB = require("./db");

exports.handler = async (event) => {
  try {
    const collection = await connectDB();
    const { topic, sortField, sortOrder = "asc", skip, take } = event.queryStringParameters;

    const query = topic ? { topic: new RegExp(topic, "i") } : {};
    const sort = sortField ? { [sortField]: sortOrder === "desc" ? -1 : 1 } : {};

    const skipValue = Number.isInteger(parseInt(skip)) ? parseInt(skip) : 0;
    const takeValue = Number.isInteger(parseInt(take)) ? parseInt(take) : 20;

    const questions = await collection
      .find(query)
      .sort(sort)
      .skip(skipValue)
      .limit(takeValue)
      .toArray();

    return { 
      statusCode: 200, 
      headers: {
        "Access-Control-Allow-Origin": "*",  // Allow all origins (change to specific domain later)
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