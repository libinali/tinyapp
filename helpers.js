// HELPER FUNCTIONS //


const generateRandomString = function() {
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * char.length);
    randomString += char[randomIndex];
  }

  return randomString;
};

const getUserByEmail = function(email, database) {

  for (const id in database) {
    const user = database[id];
    if (user.email === email) {
      return user;
    }
  }

  return null;
};

const urlsForUser = function(id, database) {
  const userURLs = {};
  for (const tinyURL in database) {
    if (database[tinyURL].userID === id) {
      userURLs[tinyURL] = database[tinyURL];
    }
  }
  return userURLs;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };