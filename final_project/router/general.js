const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


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

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books,null,4));
});

// Synchronous source endpoint for books used by Axios demo
public_users.get('/books-data', function (req, res) {
  res.send(books);
});

// Async endpoint demonstration using Axios (async/await)
public_users.get('/books-async', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/books-data');
    res.send(JSON.stringify(response.data, null, 4));
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books via Axios", error: err.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if(books[isbn]){
    res.send(JSON.stringify(books[isbn],null,4));
  }
  else{
    return res.status(404).json({message: "Book not found"});
  }
 });
  
// Get book details based on author
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

// Get all books based on title
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

//  Get book review
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
