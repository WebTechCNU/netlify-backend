const connectDB = require("./dbContext");

exports.handler = async (event) => {
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

    try {
        const collection = await connectDB('comments');
        const { category, sortField, sortOrder = "asc", skip, take } = event.queryStringParameters;

        const query = {
            ...(category && { category: new RegExp(category, "i") }),
            ...(username && { username }) 
          };
        const sort = sortField ? { [sortField]: sortOrder === "desc" ? -1 : 1 } : {};

        const skipValue = Number.isInteger(parseInt(skip)) ? parseInt(skip) : 0;
        const takeValue = Number.isInteger(parseInt(take)) ? parseInt(take) : 20;

        const items = await collection
            .find(query)
            .sort(sort)
            .skip(skipValue)
            .limit(takeValue)
            .toArray();
        return {
            statusCode: 201,
            headers: {
                "Access-Control-Allow-Origin": "*",  // Allow all origins (change to specific domain in future)
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            body: JSON.stringify(items) 
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
}