// CONSTANTS
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8080;
const randomstring = require("randomstring");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const dateFormat = require('dateformat');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  secret: 'blackcars',
  maxAge: 24 * 60 * 60 * 1000
}));

app.use(express.static(__dirname + '/public'));

// // URL database example for reference -- same as userUrls
// let urlDatabase = {
//   "b2xVn2": {
//     shortUrl: "b2xVn2",
//     longUrl: "http://www.lighthouselabs.ca",
//     userID: "userRandomID",
//     date: "",
//     hits: 0
//   },
//   "9sm5xK": {
//     shortUrl: "9sm5xK",
//     longUrl: "http://www.google.com",
//     userID: "user2RandomID",
//     date: "",
//     hits: 0
//   }
// };

// user database object for reference
// let users = {
//   "userRandomID": {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "12345"
//   },
//   "user2RandomID": {
//     id: "user2RandomID",
//     email: "user2@example.com",
//     password: "12345"
//   }
// };

let urlDatabase = {};
let userUrls = {};
let users = {};

// HELPER FUNCTIONS

// generate 6 character random string
function generateRandomString() {
  return randomstring.generate(6);
}

// returns user object or undefined if not found
function findUser(username, password){
  for (user in users){
    if (username === users[user].email && bcrypt.compareSync(password, users[user].password)){
      return users[user];
    }
  }
  return undefined;
}

// returns all of the users' urls
function urlsForUser(id){
  let userUrls = {};
  for (url in urlDatabase){
    if (id === urlDatabase[url].userID){
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
}

// returns true if url belongs to user else false
function isUserUrl(urlid, userid){
  if (urlDatabase[urlid].userID === userid){
    return true;
  } else {
    return false;
  }
}

// returns true if url exists in urlDatabase
function urlExists(id){
  for (url in urlDatabase){
    if (urlDatabase[url].shortUrl === id){
      return true;
    }
  }
  return false;
}

// ENDPOINTS
app.get("/", (req, res) => {
  let loggedIn = Boolean(req.session.userId);
  if (loggedIn){
    let templateVars = {
      userObject: {
        id: "",
        email: "",
        message: ""
      }
    };
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
  let loggedIn = Boolean(req.session.userId);
  if(!loggedIn){
    let templateVars = {
      userObject: {
        id: "",
        email: ""
      }
    };
    res.render("login", templateVars);
    return;
  } else {
    res.redirect("/");
  }
});

app.get("/register", (req, res) => {
  let loggedIn = Boolean(req.session.userId);
  if(loggedIn){
    res.redirect("/urls");
  } else {
    let templateVars = {
      userObject: {
        id: "",
        email: ""
      }
    };
    res.render("register", templateVars);
  }
});

app.post("/login", (req, res) => {
  const user = findUser(req.body.email, req.body.password);
  if (user === undefined){
    let templateVars = {
      message: "Access Denied: User or password is incorrect or does not exist"
    };
    res.render("error", templateVars);
    return;
  } else {
    req.session.userId = user;
    res.redirect("/urls");
  }
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === ""){
    let templateVars = {
      message: "Email or Password empty"
    };
    res.render("error", templateVars);
    return;
  } else {
    const encryptedPassword = bcrypt.hashSync(req.body.password, 10);
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: email,
      password: encryptedPassword
    };
    req.session.userId = users[userID];
    res.redirect("/urls");
  }
});

app.get("/urls/new", (req, res) => {
  let loggedIn = Boolean(req.session.userId);
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

app.get("/urls/:id/delete", (req, res) => {
  let loggedIn = Boolean(req.session.userId);
  if(!loggedIn){
    let templateVars = {
      message: "Access Denied: Not Logged In"
    };
    res.render("error", templateVars);
    return;
  } else if(loggedIn){
    let isMyUrl = isUserUrl(req.params.id, req.session.userId.id);
    if(!isMyUrl){
      let templateVars = {
        message: "Access Denied: Url Not Found"
      };
      res.render("error", templateVars);
      return;
    } else if(isMyUrl){
      let urlIsValid = urlExists(req.params.id);
      if(!urlIsValid){
        let templateVars = {
          message: "URL does not exist"
        };
        res.render("error", templateVars);
        return;
      } else {
        let deletedURL = delete urlDatabase[req.params.id];
        res.redirect("/urls");
      }
    }
  }
});

app.get("/urls", (req, res) => {
  let loggedIn = Boolean(req.session.userId);
  if (loggedIn){
    userUrls = urlsForUser(req.session.userId.id);
    let templateVars = {
      urls: userUrls,
      userObject: req.session.userId
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  let loggedIn = Boolean(req.session.userId);
  if(!loggedIn){
    let templateVars = {
      message: "Access Denied: Not Logged In"
    };
    res.render("error", templateVars);
    return;
  } else if (loggedIn){
    let isMyUrl = isUserUrl(req.params.id, req.session.userId.id);
    if(!isMyUrl){
      let templateVars = {
        message: "Access Denied: Url Not Found"
      };
      res.render("error", templateVars);
      return;
    } else if (isMyUrl){
      let urlIsValid = urlExists(req.params.id);
      if (!urlIsValid){
        let templateVars = {
          message: "URL does not exist"
        };
        res.render("error", templateVars);
        return;
      } else {
        let templateVars = {
          id: req.params.id,
          url: urlDatabase[req.params.id].longUrl,
          userObject: req.session.userId
        };
        res.render("urls_update", templateVars);
      }
    }
  }
});

app.post("/urls", (req, res) => {
  let date = dateFormat(new Date(), "mmmm d, yyyy");
  let loggedIn = Boolean(req.session.userId);
  if (!loggedIn){
    let templateVars = {
      message: "Access Denied: Not Logged In"
    };
    res.render("error", templateVars);
    return;
  } else if (loggedIn){
    newShortUrl = generateRandomString();
    urlDatabase[newShortUrl] = {
      shortUrl: newShortUrl,
      longUrl: req.body.longURL,
      userID: req.session.userId.id,
      date: date,
      hits: 0
    };
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.post("/urls/update", (req, res) => {
  let loggedIn = Boolean(req.session.userId);
  if (loggedIn){
    urlDatabase[req.body.id].longUrl = req.body.longURL;
    urlDatabase[req.body.id].date = dateFormat(new Date(), "mmmm d, yyyy");
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  let loggedIn = Boolean(req.session.userId);
  if (loggedIn){
    let templateVars = { shortURL: req.params.id };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/u/:shortURL", (req, res) => {
  let urlIsValid = urlExists(req.params.shortURL);
  if(!urlIsValid){
    let templateVars = {
      message: "Shortened URL does not exist"
    };
    res.render("error", templateVars);
    return;
  } else {
    let longURL = urlDatabase[req.params.shortURL].longUrl;
    // increment shortURL hits
    urlDatabase[req.params.shortURL].hits++;
    res.redirect(longURL);
  }
});

app.listen(PORT);
console.log(`Listening on port ${PORT}`);