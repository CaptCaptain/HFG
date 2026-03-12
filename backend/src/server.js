require("dotenv").config();

const express = require("express");
const server = express();
const PORT = process.env.PORT || 8080;

server.get("/", (req, res) => {
	res.send(`Welcome from ${PORT}!`);
});

server.listen(PORT, () => {
	console.log(`Hello World from ${PORT}`);
});
