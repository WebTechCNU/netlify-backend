const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI);
let collectionName = "stud-items";
let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db(process.env.DB_NAME);
  }
  return db.collection(collectionName);
}

module.exports = connectDB;

// database consistency - essentially dbContext