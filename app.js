
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8080;
const randomstring = require("randomstring");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

// set the view engine to ejs
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


function validateUser(userId) {
  for (user in users){
    //if userid = userid return true else return false
  }
  /*if (users.find((user) => user.id == userId)) {
    return true;
  } else {
    return false;
  }*/
}

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/", (req, res) => {
  if (req.session.userId === undefined){
    let templateVars = {
      userObject: {
        id: "",
        email: ""
      }
    }
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }

});

app.get('/logout', function(req, res){
  req.session = null;
  res.redirect('/login');
});

app.get("/login", (req, res) => {
 // console.log('Users: ', users);
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
    res.send("400 Bad Request")
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
  let templateVars = {
    urls: urlDatabase,
    userObject: req.session.userId
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/delete/:id", (req, res) => {
  let deletedURL = delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
      console.log(req.session.userId);
  let templateVars = {
    urls: urlDatabase,
    userObject: req.session.userId
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/update/:id", (req, res) => {
  let templateVars = {
    id: req.params.id,
    url: urlDatabase[req.params.id],
    userObject: req.session.userId
  };
  res.render("urls_update", templateVars);
});

app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/update", (req, res) => {
  // console.log(req.body);
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