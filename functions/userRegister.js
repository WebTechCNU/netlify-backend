const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const connectDB = require("./dbContext");

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

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { username, password, role } = JSON.parse(event.body);

    if (!password) {
        return { statusCode: 400, body: JSON.stringify({ error: "Password is required" }) };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const collection = await connectDB('users');
    const result = await collection.insertOne({ username, hashedPassword, role });

    const secretKey = process.env.JWT_SECRET;
    const token = jwt.sign({ username, role }, secretKey, { expiresIn: "1h" });

    return {
        statusCode: 200, 
            headers: {
              "Access-Control-Allow-Origin": "*",  // Allow all origins (change to specific domain in future)
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type"
            },
        body: JSON.stringify({ token }),
      };
}

