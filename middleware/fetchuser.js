// jshint esversion: 6
require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const fetchuser = async (req, res, next) => {
  // get the user form jwt token and add it to req object
  const token = await req.header("auth-token");
  if (!token) {
    res
      .status(401)
      .send({ error: "Please authenticate using a valid credential." });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = await data.user;
    await next();
  } catch (error) {
    res
      .status(401)
      .send({ error: "Please authenticate using a valid credential." });
  }
};

module.exports = fetchuser;
