const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body; // Take username and password from request body

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username already exists using the utility function from auth_users.js
  if (!isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Register the user by pushing to the array
  users.push({ "username": username, "password": password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn; 
  const book = books[isbn];    

  if (book) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(book, null, 4)); 
  } else {
    return res.status(404).json({ message: "Book not found" }); 
  }
});
  
// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const requestedAuthor = req.params.author.toLowerCase();
  const keys = Object.keys(books); 
  const matchingBooks = {};

  keys.forEach(key => {
    if (books[key].author.toLowerCase() === requestedAuthor) {
      matchingBooks[key] = books[key];
    }
  });

  if (Object.keys(matchingBooks).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const requestedTitle = req.params.title.toLowerCase();
  const keys = Object.keys(books); 
  const matchingBooks = {};

  keys.forEach(key => {
    if (books[key].title.toLowerCase() === requestedTitle) {
      matchingBooks[key] = books[key];
    }
  });

  if (Object.keys(matchingBooks).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn; 
  const book = books[isbn];    

  if (book) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;