const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Helper function: check if the username is unique/valid for registration
const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return false; // Username already exists
  } else {
    return true; // Username is available
  }
}

// Helper function: check if username and password match our records
const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

// Task 7: Only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    }
    
    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(428).json({ message: "Invalid Login. Check username and password" });
  }
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.query.review; 
  const username = req.session.authorization?.username; 

  if (!reviewText) {
    return res.status(400).json({ message: "Review text query parameter is required" });
  }

  if (books[isbn]) {
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
    books[isbn].reviews[username] = reviewText;
    return res.status(200).json({ 
      message: `Review for ISBN ${isbn} has been successfully added/updated by user '${username}'`,
      reviews: books[isbn].reviews 
    });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username; // Get username from session

  if (books[isbn]) {
    // Check if a review exists from this specific user
    if (books[isbn].reviews && books[isbn].reviews[username]) {
      // Hint: Delete the review based on the session username
      delete books[isbn].reviews[username];
      return res.status(200).json({ message: `Reviews for ISBN ${isbn} posted by user '${username}' have been deleted.` });
    } else {
      return res.status(404).json({ message: `No review found for ISBN ${isbn} from user '${username}'` });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;