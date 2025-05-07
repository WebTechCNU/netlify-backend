const connectDB = require("./dbContext");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

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
    let username = null;
    let role = "user";

    if (!token) {
        return { statusCode: 401, headers: {
            "Access-Control-Allow-Origin": "*",  // Allow all origins (change to specific domain in future)
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }, body: JSON.stringify({ error: "Unauthorized: No token provided", details: error.message }) };
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        username = decoded.username;
        role = decoded.role;

    } catch (error) {
        return { statusCode: 403, headers: {
            "Access-Control-Allow-Origin": "*",  // Allow all origins (change to specific domain in future)
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }, body: JSON.stringify({ error: "Forbidden: Invalid token", details: error.message}) };
    }


    try {
        const collection = await connectDB('user-items');
        const item = JSON.parse(event.body);

        item.username = username; 
        let result;
        if(role == "admin"){
            result = await collection.insertOne(item);
        }
        else{
            throw new Error("Unauthorized: Only admins can create items");
        }
        return {
            statusCode: 201,
            headers: {
                "Access-Control-Allow-Origin": "*",  // Allow all origins (change to specific domain in future)
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({ id: result.insertedId })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};