const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
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

// Task 10: Get the book list available in the shop using Async-Await / Promises
public_users.get('/', async function (req, res) {
  try {
    // Wrapping the local data retrieval in an asynchronous Promise
    const getBooksList = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(books);
        }, 100); // Simulates network/database latency
      });
    };

    const bookList = await getBooksList();
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books data" });
  }
});

// Task 11: Get book details based on ISBN using Async-Await / Promises
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Using explicit Promise Callback pattern
  const getBookByISBN = new Promise((resolve, reject) => {
    setTimeout(() => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject({ status: 404, message: "Book not found" });
      }
    }, 100);
  });

  getBookByISBN
    .then((book) => {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(JSON.stringify(book, null, 4));
    })
    .catch((err) => {
      return res.status(err.status || 500).json({ message: err.message });
    });
});
  
// Task 12: Get book details based on author using Async-Await / Promises
public_users.get('/author/:author', async function (req, res) {
  try {
    const requestedAuthor = req.params.author.toLowerCase();

    const getBooksByAuthor = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const keys = Object.keys(books);
          const matchingBooks = {};
          
          keys.forEach(key => {
            if (books[key].author.toLowerCase() === requestedAuthor) {
              matchingBooks[key] = books[key];
            }
          });

          if (Object.keys(matchingBooks).length > 0) {
            resolve(matchingBooks);
          } else {
            reject({ status: 404, message: "No books found for this author" });
          }
        }, 100);
      });
    };

    const foundBooks = await getBooksByAuthor();
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(foundBooks, null, 4));
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

// Task 4 / Task 13 Placeholder: Get all books based on title
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

// Get book review
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