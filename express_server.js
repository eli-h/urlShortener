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

function generateRandomString(){
	let random = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i =0; i < 6; i++){
    random += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return random;
}

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
  console.log(req.cookies)
  console.log(usernameCookie)
	let templateVars = {username: usernameCookie, urls: urlDatabase};
	res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
	let templateVars = {username: req.cookies['username']}
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {username: req.cookies['username'], shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});