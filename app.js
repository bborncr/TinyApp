
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8080;
const randomstring = require("randomstring");

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

// generate 6 character random string
function generateRandomString() {
  return randomstring.generate(6);
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.render("urls_index");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id };
  res.render("urls_show", templateVars);
});

app.listen(PORT);
console.log(`Listening on port ${PORT}`);