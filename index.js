require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false })).use(bodyParser.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res) {
  const protocol_regex = /^\D{3,5}:\/\//;
  const validate_url = (req, res, next) => {
    console.log("------request------------------");
    console.log(req.body.url);
    console.log("------validate------------------");
    console.log("protocol: " + protocol_regex.test(req.body.url));
    console.log("------validate------------------");
    if (protocol_regex.test(req.body.url)) {
      console.log("probs a url");
    } else {
      return res.status(400).json({
        error: "invalid url",
      });
    }
    next();
  };
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
