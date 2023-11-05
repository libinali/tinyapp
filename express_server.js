// Express
const express = require("express");
const app = express();

// Port
const PORT = 8080; // default port 8080

// Morgan
const morgan = require("morgan");
app.use(morgan('dev'));

// Cookie parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Ejs
app.set("view engine", "ejs");

// Bcryptjs
const bcrypt = require("bcryptjs");


  // DATA //


// New database with ID
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "lola",
    
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "moo",
  },
};

// User database
const users = {
  lola: {
    id: 'lola',
    email: "a@a.com",
    password: "123",
  },
  moo: {
    id: "moo",
    email: "b@b.com",
    password: "456",
  },
};


  // HELPER FUNCTION //


const generateRandomString = function() {
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * char.length);
    randomString += char[randomIndex];
  }

  return randomString;
};

const getUserByEmail = function(email) {
  
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }

  return null;
};

const urlsForUser = function(id) {
  const userURLs = {};
  for (const tinyURL in urlDatabase) {
    if (urlDatabase[tinyURL].userID === id) {
      userURLs[tinyURL] = urlDatabase[tinyURL];
    }
  }
  return userURLs;
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
  const userID = req.cookies.user_id;
  const user = users[userID];
  const userURLs = urlsForUser(userID);

  if (!user) {
    return res.status(404).send('Please login or register');
  }

  
  const templateVars = { urls: userURLs, user };
  res.render("urls_index", templateVars);
});

// Create new URL Page
app.get("/urls/new", (req, res) => {
  const userID = req.cookies.user_id;

  if (!userID || !users[userID]) {
    res.redirect("/login");
  }
  const user = users[userID];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

// Register Page
app.get("/register", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];

  if (userID && users[userID]) {
    res.redirect("/urls");
  }

  const templateVars = { user };
  res.render("register", templateVars);
});

// Login Page
app.get("/login", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];

  if (userID && users[userID]) {
    res.redirect("/urls");
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
  const userID = req.cookies.user_id;
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
  const userId = req.cookies.user_id;

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
  const userID = req.cookies.user_id;
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
  const userID = req.cookies.user_id;
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
  
  console.log(email, password);

  const user = getUserByEmail(email);
  console.log(user);

  if (!user) {
    return res.status(403).send("User Not Found");
  }
  
  const result = bcrypt.compareSync(password, user.password);

  if (!result) {
    return res.status(403).send("Incorrect Password");
  }
  
  res.cookie('user_id', user.id);
  res.redirect("/urls");
});

// Logouts User
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
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

  const existingId = getUserByEmail(email);

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

  res.cookie('user_id', newId);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
