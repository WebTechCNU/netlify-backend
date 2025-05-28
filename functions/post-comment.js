const connectDB = require("./dbContext");

exports.handler = async (event) => {
    try {
        if (event.httpMethod === "OPTIONS") {
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*", // Change to frontend domain in future
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
                body: "",
            };
        }

        const collection = await connectDB('comments');
        const comment = JSON.parse(event.body);
        comment.createdAt = new Date();

        result = await collection.insertOne(comment);

        return {
            statusCode: 201,
            headers: {
                "Access-Control-Allow-Origin": "*",  // Allow all origins (change to specific domain in future)
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            body: JSON.stringify({ id: result.insertedId })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
}