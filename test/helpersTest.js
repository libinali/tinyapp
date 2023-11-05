const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

// getUserByEmail Test
const testUsers = {
  "Kiki": {
    id: "Kiki",
    email: "kiki@me.com",
    password: "purple-monkey-dinosaur"
  },
  "Bobo": {
    id: "Bobo",
    email: "Bobo@me.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', () => {
    const user = getUserByEmail("kiki@me.com", testUsers);
    const expectedUserID = "Kiki";
    assert.equal(user.id, expectedUserID);
  });

  it('should return undefined for a non-existent email', () => {
    const user = getUserByEmail('hello@me.com', testUsers);
    assert.equal(user, undefined);
  });
});


// urlsForUser Test

const testUrls = {
  'abcd': {
    longURL: 'http://www.youtube.com',
    userID: 'Blue'
  },
  'efgh': {
    longURL: 'http://www.instagram.com',
    userID: 'Pink'
  },
  'ijkl': {
    longURL: 'http://www.google.com',
    userID: 'Green'
  }
};

describe('urlsForUser', () => {
  it('should return URLs for a valid user ID', () => {
    const userUrls = urlsForUser('Pink', testUrls);
    const expectedResult = {
      'efgh': {
        longURL: 'http://www.instagram.com',
        userID: 'Pink'
      },
    };

    assert.deepEqual(userUrls, expectedResult);
  });

  it('should return an empty object for a non-existent user ID', () => {
    const userUrls = urlsForUser('Yellow', testUrls);
    assert.deepEqual(userUrls, {});
  });
});