const jwt = require("jsonwebtoken");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { username, password } = JSON.parse(event.body);

  if (username !== process.env.USERNAME || password !== process.env.PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: "Invalid credentials" }) };
  }

  const secretKey = process.env.JWT_SECRET;
  const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });

  return {
    statusCode: 200,
    body: JSON.stringify({ token }),
  };
};