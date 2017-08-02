const bodyParser = require("body-parser");
var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

var cookieParser = require('cookie-parser')
app.use(cookieParser());

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
	"randomID":{
    id: "randomID",
    email: "test@test.com",
    password: "testpassword"
	},
	"randomID2":{
		id: "randomID2",
		email: "champagnpapi@mandem.ca",
		password: "gossa"
	}
};

function generateRandomString(){
	let random = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i =0; i < 6; i++){
    random += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return random;
}
//renders login page
app.get("/login", (req, res) => {
  let userId = req.cookies['user_id']
  let user = users[userId];
  res.render("urls_login", {user: user});
});

//renders the register page
app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.get("/", (req, res) => {
  res.end("Hello!");
});
    
app.get("/urls", (req, res) => {
  let usernameCookie
  if (req.cookies) {
    usernameCookie = req.cookies['username']
  }	else {
    usernameCookie = undefined;  
  }
	let templateVars = {
    users: users[user_id], 
    urls: urlDatabase
  };
	res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
	let templateVars = users
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    users: users[user_id], 
    shortURL: req.params.id, 
    longURL: urlDatabase[req.params.id] 
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => { 
  //what if 2 users want to use same link?
  urlDatabase[req.params.id] = req.body.updateURL;
  res.redirect("/urls");       
});

app.post("/urls", (req, res) => { 
  let x = generateRandomString()
  urlDatabase[x] = req.body.longURL;
  res.redirect("urls/" + x);       
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  console.log(longURL)
  res.redirect(longURL);
});

app.post("/urls/:key/delete", (req, res) => { 
  delete urlDatabase[req.params.key];
  res.redirect("/urls/");       
});

app.post("/login", (req, res) => { 
  res.cookie('username', req.body.username)
  res.redirect("/urls/");       
});

app.post("/logout", (req, res) => { 
  res.clearCookie('username')
  res.redirect("/urls/");       
});

app.post("/register", (req, res) => {
  let x = generateRandomString();
  let userEmail = req.body.email
  let userPassword = req.body.password
  if (userEmail.length <= 0 || userPassword.length <= 0){
    res.status(400);
    res.send("404")
    res.redirect('/register')
  } else {
    for (let key in users){
      if (users[key].email === userEmail){
        res.send("already exists")
        break;
      }
    }
  }
  users[x] = {
    email: userEmail,
    password: userPassword
  }
  res.cookie('user_id', x)
  res.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});