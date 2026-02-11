const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

/**
 * Register a new user
 * - Validates that username and password are provided
 * - Checks if the username already exists
 * - Adds the new user to the users array
 */
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({message: "User already exists"});
  }

  users.push({ username: username, password: password });
  return res.status(200).json({message: "User successfully registered"});
});

/**
 * Get the full list of books
 * - Returns all books in the database
 */
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books,null,4));
});

/**
 * Synchronous endpoint for books
 * - Used by Axios demo routes
 */
public_users.get('/books-data', function (req, res) {
  res.send(books);
});

/**
 * Asynchronous endpoint using Axios (async/await)
 * - Demonstrates fetching books from another endpoint
 */
public_users.get('/books-async', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/books-data');
    res.send(JSON.stringify(response.data, null, 4));
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books via Axios", error: err.message });
  }
});

/**
 * Get book details by ISBN
 * - Extracts ISBN from request params
 * - Returns book details if found, otherwise 404
 */
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if(books[isbn]){
    res.send(JSON.stringify(books[isbn],null,4));
  }
  else{
    return res.status(404).json({message: "Book not found"});
  }
});

/**
 * Get book details by ISBN using Axios with Promise (then/catch)
 */
public_users.get('/isbn-promise/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then(response => {
      try {
        const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        res.send(JSON.stringify(data, null, 4));
      } catch (e) {
        res.send(response.data);
      }
    })
    .catch(err => {
      return res.status(500).json({ message: "Error fetching book via Axios (promise)", error: err.message });
    });
});

/**
 * Get book details by ISBN using Axios with async/await
 */
public_users.get('/isbn-async/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    try {
      const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      res.send(JSON.stringify(data, null, 4));
    } catch (e) {
      res.send(response.data);
    }
  } catch (err) {
    return res.status(500).json({ message: "Error fetching book via Axios (async)", error: err.message });
  }
});

/**
 * Get book details by Author (synchronous)
 * - Loops through all books and matches author name
 */
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  let authorBooks = {};
  let keys = Object.keys(books);
  keys.forEach(key => {
    if(books[key].author === author){
      authorBooks[key] = books[key];
    }
  });
  if(Object.keys(authorBooks).length > 0){
    res.send(JSON.stringify(authorBooks,null,4));
  }
  else{
    return res.status(404).json({message: "Author not found"});
  }
});

/**
 * Get book details by Title (synchronous)
 * - Loops through all books and matches title
 */
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  let titleBooks = {};
  let keys = Object.keys(books);
  keys.forEach(key => {
    if(books[key].title === title){
      titleBooks[key] = books[key];
    }
  });
  if(Object.keys(titleBooks).length > 0){
    res.send(JSON.stringify(titleBooks,null,4));
  }
  else{
    return res.status(404).json({message: "Title not found"});
  }
});

/**
 * Get book reviews by ISBN
 * - Returns reviews object if book exists
 */
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if(books[isbn]){
    res.send(JSON.stringify(books[isbn].reviews,null,4));
  }
  else{
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;