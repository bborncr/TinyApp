
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8080;
const randomstring = require("randomstring");
const cookieParser = require('cookie-parser')

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

app.use(express.static(__dirname + '/public'));

// generate 6 character random string
function generateRandomString() {
  return randomstring.generate(6);
}

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  if (req.cookies["username"]){
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }

});

app.get('/logout', function(req, res){
  res.clearCookie('username');
  res.redirect('/');
});

app.get("/login", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.render("login", templateVars);
  //res.redirect("/urls");
});

app.post("/login", (req, res) => {
  // console.log(req.body);
  if (req.body.username === ""){
    res.redirect("/login");
  }
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/delete/:id", (req, res) => {
  let deletedURL = delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/update/:id", (req, res) => {
  let templateVars = {
    id: req.params.id,
    url: urlDatabase[req.params.id],
    username: req.cookies["username"]
  };
  res.render("urls_update", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  urlDatabase[generateRandomString()] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/update", (req, res) => {
  console.log(req.body);
  urlDatabase[req.body.id] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT);
console.log(`Listening on port ${PORT}`);