const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'url_id',
  keys: ['iuytfdghjikuygfvbnjkiuyt']
}));

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "randomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "randomID2"
  }
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
		password: "brej"
	}
};
//gathers all link associated with user
function urlsForUser(id){
  let userLinks = {};
  //let current_user = req.cookies['user_id']
  for (let url in urlDatabase){
    if (urlDatabase[url].userID === id){
      userLinks[url] = urlDatabase[url]
    }
  }
  return userLinks;
}
//generates random short url
function generateRandomString(){
	let random = "";
	let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i =0; i < 6; i++){
    random += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return random;
}
//renders login page
app.get("/login", (req, res) => {
  let userId = req.session.user_id
  let user = users[userId];
  res.render("urls_login", {user});
});

//renders the register page
app.get("/register", (req, res) => {
  let current_user = users[req.session['user_id']];
  if (!current_user){
      res.render("urls_register");
    } else {
      res.redirect('/urls')
    }

});

app.get("/", (req, res) => {
  res.end("Hello!");
});
//renders urls page with users links, or redirects to login   
app.get("/urls", (req, res) => {
  let current_user = users[req.session['user_id']];
  let userId = req.session['user_id'];
  let user = users[userId];
  let links = urlsForUser(req.session['user_id']);
  let templateVars = {
    user, 
    urls: links
  };
  if (!current_user){
    res.redirect('/login');
    return;
  } else {
    templateVars.link = links; 
  }

	res.render('urls_index', templateVars);
});
//renders page where user can create new short links
app.get("/urls/new", (req, res) => {
  let current_user = req.session['user_id'];
  let userId = req.session['user_id'];
  let user = users[userId];
  if (current_user) {
    res.render("urls_new", {user: user});
  } else {
    res.redirect('/login');
  }
});
//renders edit page for short urls
app.get("/urls/:id", (req, res) => {

  let current_user = req.session['user_id'];

  if (!urlDatabase[req.params.id]){
    res.send('short URL doesn\'t exist')
  } else if (current_user === urlDatabase[req.params.id]['userID']){
    let templateVars = {
      user: users[req.session.user_id], 
      shortURL: req.params.id, 
      longURL: urlDatabase[req.params.id].longURL
    }
    res.render("urls_show", templateVars);
    return;
  } else {
    res.send('cannot edit someone elses url');
    return;
  }

});

app.post("/urls/:id", (req, res) => { 
  urlDatabase[req.params.id].longURL = req.body.updateURL;
  res.redirect("/urls");       
});

app.post("/urls", (req, res) => { 
  let x = generateRandomString();
  urlDatabase[x] = {
    longURL: req.body.longURL,
    userID: req.session['user_id']
  }
  res.redirect("urls/");       
});
//redirects to longlink if it exists
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]){
    let longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
    return;
  } else {
    res.send('short link doesn\'t exist');
    return;
  }

});

app.post("/urls/:key/delete", (req, res) => { 
  let current_user = req.session['user_id'];
  if (current_user === urlDatabase[req.params.key]['userID']){
    delete urlDatabase[req.params.key];
  }
  res.redirect("/urls/");       
});

app.post("/login", (req, res) => { 
  let userId = req.session['user_id'];
  let user = users[userId];
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  for (let key in users){
    if (users[key].email === userEmail){
      if (bcrypt.compareSync(userPassword, users[key].password)){
        req.session.user_id = users[key].id;
        res.redirect("/urls/"); 
      } else {
        res.send('incorrect password');
      }
    }
  } 
  res.send('email not registered');    
});

app.post("/logout", (req, res) => { 
  req.session = null;
  res.redirect("/urls/");       
});

app.post("/register", (req, res) => {
  let x = generateRandomString();
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let hashed_password = bcrypt.hashSync(userPassword, 10);
  if (userEmail.length <= 0 || userPassword.length <= 0){
    res.redirect('/register');
  } else {
    for (let key in users){
      if (users[key].email === userEmail){
        res.send("already exists");
        break;
      }
    }
  }
  users[x] = {
    id: x,
    email: userEmail,
    password: hashed_password
  }
  req.session.user_id = x;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});