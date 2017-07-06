
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8080;
const randomstring = require("randomstring");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  secret: 'blackcars',
  maxAge: 24 * 60 * 60 * 1000
}));

app.use(express.static(__dirname + '/public'));

// generate 6 character random string
function generateRandomString() {
  return randomstring.generate(6);
}

// returns user object or undefined if not found
function findUser(username, password){
  for (user in users){
    if (username === users[user].email && password === users[user].password){
      return users[user];
    }
  }
  return undefined;
}

// returns all the users' urls
function urlsForUser(id){
  let userUrls = {};
  for (url in urlDatabase){
    if (id === urlDatabase[url].userID){
      userUrls[urlDatabase[url].shortUrl] = urlDatabase[url].longUrl;
    }
  }
  return userUrls;
}

let urlDatabase = {
  "b2xVn2": {
    shortUrl: "b2xVn2",
    longUrl: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    shortUrl: "9sm5xK",
    longUrl: "http://www.google.com",
    userID: "user2RandomID"
  }
};

let userUrls = {};

// let userUrls = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "12345"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "12345"
  }
};

app.get("/", (req, res) => {
  let loggedIn = !!req.session.userId;
  if (loggedIn){
    let templateVars = {
      userObject: {
        id: "",
        email: ""
      }
    }
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get('/logout', function(req, res){
  req.session = null;
  res.redirect('/login');
});

app.get("/login", (req, res) => {
 let templateVars = {
      userObject: {
        id: "",
        email: ""
      }
    }
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {
      userObject: {
        id: "",
        email: ""
      }
    }
  res.render("register", templateVars);
});

app.post("/login", (req, res) => {
  const user = findUser(req.body.email, req.body.password);
  if (user === undefined){
    res.redirect("/login");
  } else {
    req.session.userId = user;
    res.redirect("/urls");
  }
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === ""){
    res.send("400 Bad Request");
  } else {
    users[userID] = {
      id: userID,
      email: email,
      password: password
    }
    console.log(users);
    req.session.userId = users[userID];
    res.redirect("/urls");
  }
});

app.get("/urls/new", (req, res) => {
  let loggedIn = !!req.session.userId;
  if (loggedIn){
    let templateVars = {
    urls: urlDatabase,
    userObject: req.session.userId
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/delete/:id", (req, res) => {
  let loggedIn = !!req.session.userId;
  if (loggedIn){
  let deletedURL = delete urlDatabase[req.params.id];
  res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  let loggedIn = !!req.session.userId;
  if (loggedIn){
  userUrls = urlsForUser(req.session.userId.id);
  let templateVars = {
    urls: userUrls,
    userObject: req.session.userId
  };
  // console.log("TEMPLATEVARS: ", templateVars);
  res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/update/:id", (req, res) => {
  let loggedIn = !!req.session.userId;
  if (loggedIn){
  let templateVars = {
    id: req.params.id,
    url: urlDatabase[req.params.id].longUrl,
    userObject: req.session.userId
  };
  res.render("urls_update", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  let loggedIn = !!req.session.userId;
  if (loggedIn){
    newShortUrl = generateRandomString();
    urlDatabase[newShortUrl] = {
      shortUrl: newShortUrl,
      longUrl: req.body.longURL,
      userID: req.session.userId.id
    }
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.post("/urls/update", (req, res) => {
  let loggedIn = !!req.session.userId;
  if (loggedIn){
  urlDatabase[req.body.id].longUrl = req.body.longURL;
  res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  let loggedIn = !!req.session.userId;
  if (loggedIn){
  let templateVars = { shortURL: req.params.id };
  res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longUrl;
  res.redirect(longURL);
});

app.listen(PORT);
console.log(`Listening on port ${PORT}`);