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

    const token = event.headers.authorization?.split(" ")[1];
    const secretKey = process.env.JWT_SECRET;
    let username = null;

    if (!token) {
        return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized: No token provided" }) };
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        username = decoded.username;
    } catch (error) {
        return { statusCode: 403, body: JSON.stringify({ error: "Forbidden: Invalid token" }) };
    }


    try {
        const collection = await connectDB('user-items');
        const item = JSON.parse(event.body);

        item.username = username; 
        const result = await collection.insertOne(item);
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