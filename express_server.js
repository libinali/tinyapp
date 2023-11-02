const express = require("express");
const morgan = require("morgan")
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(morgan('dev'));
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

app.get("/register", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  const templateVars = { user };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  const templateVars = { user };
  res.render("login", templateVars);
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
  const email = req.body.email;
  const password = req.body.password;

  const user = getUserByEmail(email);

  if (!user) {
    return res.status(403).send("User Not Found");
  }

  if (user.password !== password) {
    return res.status(403).send("Incorrect Password")
  }

  res.cookie('user_id', user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
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

// FIND BY EMAIL HELPER FUNCTION
const getUserByEmail = function(email) {
  for (const newAcc in users) {
    if (users[newAcc].email === email) {
      return users[newAcc];
    }
  }
  return null;
};

app.post("/register", (req, res) => {
  const newId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

   // Checks if the e-mail or password are empty strings 
  if (email === '' || password === '') {
    return res.status(400).send("Email and password cannot be empty");
  }

  // Checks the function to see if the user exists
  const existingId = getUserByEmail(email);

  if (existingId) {
    return res.status(400).send("Email is already in use");
  }

 // CREATING A NEW USER
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
