const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios'); // Explicitly required for Tasks 10-13

// Base URL used to fulfill the Axios requirement
const BASE_URL = "http://localhost:5000";

// Route to register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ "username": username, "password": password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Helper clean books route serving as our internal API data source
public_users.get('/clean/books', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 10: Get the book list available in the shop using Async-Await with Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/clean/books`);
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list via Axios", error: error.message });
  }
});

// Task 11: Get book details based on ISBN using Async-Await with Axios
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`${BASE_URL}/clean/books`);
    const booksList = response.data;
    
    if (booksList[isbn]) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(JSON.stringify(booksList[isbn], null, 4));
    } else {
      // Required explicit error handling
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book details via Axios", error: error.message });
  }
});
  
// Task 12: Get book details based on author using Async-Await with Axios
public_users.get('/author/:author', async function (req, res) {
  const requestedAuthor = req.params.author.toLowerCase();
  try {
    const response = await axios.get(`${BASE_URL}/clean/books`);
    const booksList = response.data;
    const keys = Object.keys(booksList);
    const matchingBooks = {};

    keys.forEach(key => {
      if (booksList[key].author.toLowerCase() === requestedAuthor) {
        matchingBooks[key] = booksList[key];
      }
    });

    if (Object.keys(matchingBooks).length > 0) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    } else {
      // Required explicit error handling when the author is not found
      return res.status(404).json({ message: `No books found for author: ${req.params.author}` });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching author details via Axios", error: error.message });
  }
});

// Task 13: Get all books based on title using Async-Await with Axios
public_users.get('/title/:title', async function (req, res) {
  const requestedTitle = req.params.title.toLowerCase();
  try {
    const response = await axios.get(`${BASE_URL}/clean/books`);
    const booksList = response.data;
    const keys = Object.keys(booksList);
    const matchingBooks = {};

    keys.forEach(key => {
      if (booksList[key].title.toLowerCase() === requestedTitle) {
        matchingBooks[key] = booksList[key];
      }
    });

    if (Object.keys(matchingBooks).length > 0) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    } else {
      // Required explicit error handling when title is not found
      return res.status(404).json({ message: `No books found with title: ${req.params.title}` });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching title details via Axios", error: error.message });
  }
});

// Task 5 Fix: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn; 
  const book = books[isbn];    
  
  if (book) {
    if (!book.reviews || Object.keys(book.reviews).length === 0) {
      return res.status(200).json({ message: "No reviews available for this book yet." });
    }
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;