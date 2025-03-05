const connectDB = require("./dbItem");

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
    const item = JSON.parse(event.body);

    const result = await collection.insertOne(item);
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