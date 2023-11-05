// Express
const express = require("express");
const app = express();

// Port
const PORT = 8080; // default port 8080

// Morgan
const morgan = require("morgan");
app.use(morgan('dev'));

// Cookie Session
const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: 'session',
  keys: ['lololololol'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use(express.urlencoded({ extended: true }));

// Ejs
app.set("view engine", "ejs");

// Bcryptjs
const bcrypt = require("bcryptjs");

// Helper functions
const { generateRandomString, getUserByEmail, urlsForUser} = require('./helpers');


  // DATA //


// New database with ID
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "Lola",
    
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "Joe",
  },
};

// User database
const users = {
  Lola: {
    id: 'Lola',
    email: "a@a.com",
    password: "$2a$10$hT7SQowgEq0nUMWVHmXZe.w7XANrA5FRAu8F8BaG6psD7yMIraakK",
  },
  Joe: {
    id: "Joe",
    email: "b@b.com",
    password: "$2a$10$/3/tty0NvKMg7CxNiJs2yOF0iLfDNXE0cJ96PdPxlznbBbWcBbNkC",
  },
};


  // GET //


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.send("Hello! Welcome to TinyAPP!");
});

// Main Page
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const userURLs = urlsForUser(userID, urlDatabase);

  if (!user) {
    return res.status(404).send('Please login or register');
  }

  
  const templateVars = { urls: userURLs, user };
  res.render("urls_index", templateVars);
});

// Create new URL Page
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;

  if (!userID || !users[userID]) {
    res.redirect("/login");
  }
  const user = users[userID];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

// Register Page
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  if (userID && users[userID]) {
    res.redirect("/urls");
  }

  const templateVars = { user };
  res.render("register", templateVars);
});

// Login Page
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  if (userID && users[userID]) {
    return res.redirect("/urls");
  }

  const templateVars = { user };
  res.render("login", templateVars);
});

// ID redirection to long URL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const url = urlDatabase[id];

  if (!url) {
    return res.status(404).send('URL Not Found');
  }
  
  res.redirect(url.longURL);

});

// Edit ID page 
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userID = req.session.user_id;
  const user = users[userID];
  const url = urlDatabase[id];

  if (!user) {
    return res.status(404).send('Please login or register');
  }

  if (!url) {
    return res.status(404).send('URL Not Found');
  }

  if (url.userID !== userID) {
    return res.status(404).send('Not Authorized');
  }

  const longURL = url.longURL;
  const templateVars = { id, longURL, user };
  res.render("urls_show", templateVars);

});


  // POST //


// Generates new ID and ads it to the URL database
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;

  if (!userId || !users[userId]) {
    return res.status(403).send("Please login or register to create new URLs.");
  } else {
    const newKey = generateRandomString();
    const newURL = req.body.longURL;

    urlDatabase[newKey] = {
      longURL: newURL,
      userID: userId
    };

    res.redirect(`/urls/${newKey}`);
  }
});

// Deletes URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userID = req.session.user_id;
  const user = users[userID];
  const url = urlDatabase[id];

  if (!user) {
    return res.status(404).send('Please login or register');
  }

  if (!url) {
    return res.status(404).send('URL Not Found');
  }

  if (url.userID !== userID) {
    return res.status(404).send('Not Authorized');
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

// Edits and updates URLs
app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  const userID = req.session.user_id;
  const user = users[userID];
  const url = urlDatabase[id];

  if (!user) {
    return res.status(404).send('Please login or register');
  }

  if (!url) {
    return res.status(404).send('URL Not Found');
  }

  if (url.userID !== userID) {
    return res.status(404).send('Not Authorized');
  }

  url.longURL = req.body.longURL;
  res.redirect("/urls");
});

// Authenticates User
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = getUserByEmail(email, users);
  console.log(user);

  if (!user) {
    return res.status(403).send("User Not Found");
  }
  
  const result = bcrypt.compareSync(password, user.password);

  if (!result) {
    return res.status(403).send("Incorrect Password");
  }
  
  req.session.user_id = user.id;
  res.redirect("/urls");
});

// Logouts User
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Registers User
app.post("/register", (req, res) => {
  const newId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(password, salt);
 
  if (email === '' || password === '') {
    return res.status(400).send("Email and password cannot be empty");
  }

  const existingId = getUserByEmail(email, users);

  if (existingId) {
    return res.status(400).send("Email is already in use");
  }

  const newUser = {
    id: newId,
    email: req.body.email,
    password: hash,
  };

  users[newId] = newUser;
  console.log(users);

  req.session.user_id = newUser.id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
