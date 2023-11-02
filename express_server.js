const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const newKey = generateRandomString();
  urlDatabase[newKey] = req.body.longURL;
  res.redirect(`/urls/${newKey}`)
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const userID = req.cookies.user_id;
  const user = users[userID];
  const templateVars = { id, longURL, user};
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect("/urls")
});

function generateRandomString() {
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * char.length);
    randomString += char[randomIndex];
  }

  return randomString;
}

app.post("/login", (req, res) => {
  res.cookie('user_id', req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("register");
});

const users = {
  userRandomID: {
    id: "Lighthouse Labs",
    email: "a@a.com",
    password: "123",
  },
  user2RandomID: {
    id: "Libin",
    email: "b@b.com",
    password: "456",
  },
};

app.post("/register", (req, res) => {
  const newId = generateRandomString();
  const newUser = {
    id: newId,
    email: req.body.email,
    password: req.body.password,
  };
  users[newId] = newUser;
  console.log(users);
  res.cookie('user_id', newId);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
