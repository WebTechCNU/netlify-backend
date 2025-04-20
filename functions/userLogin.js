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

    const { username, password } = JSON.parse(event.body);

    if (!username || !password) {
        return { statusCode: 400, body: JSON.stringify({ error: "Username and password are required" }) };
    }

    const collection = await connectDB('users');
    const user = await collection.findOne({ username });

    if (!user) {
        return { statusCode: 401, body: JSON.stringify({ error: "Invalid username or password" }) };
    }

    const isMatch = await bcrypt.compare(password, user.hashedPassword);

    if (!isMatch) {
        return { statusCode: 401, body: JSON.stringify({ error: "Invalid username or password" }) };
    }

    const secretKey = process.env.JWT_SECRET;
    const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*", // Change to frontend domain in future
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ token }),
    };
}