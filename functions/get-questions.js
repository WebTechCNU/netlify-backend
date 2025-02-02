const { MongoClient } = require("mongodb");
require("dotenv").config();

// MongoDB connection string
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

exports.handler = async (event, context) => {
  try {
    // Connect to MongoDB
    await client.connect();
    const database = client.db("your-database-name");
    const collection = database.collection("your-collection-name");

    // Example: Insert a document
    const result = await collection.insertOne({ name: "Netlify", type: "Serverless" });

    // Example: Retrieve documents
    const documents = await collection.find({}).toArray();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Data fetched successfully",
        documents,
        insertedId: result.insertedId,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    await client.close();
  }
};
