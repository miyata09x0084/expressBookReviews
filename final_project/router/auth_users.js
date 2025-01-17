const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
};

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );
    // Store access token and username in session
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;

  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }

  // ISBNをキーとして本を取得
  let book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // ユーザーがこの本に既にレビューをしているか確認
  let userReview = book.reviews[username];

  if (userReview) {
    // 既存のレビューを更新
    book.reviews[username] = review;
    return res.status(200).json({ message: "Review updated successfully" });
  } else {
    // 新しいレビューを追加
    book.reviews[username] = review;
    return res.status(201).json({ message: "Review added successfully" });
  }
});

// 書籍レビューを削除
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  // ISBNをキーとして本を取得
  let book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // ユーザーがこの本にレビューをしているか確認
  let userReview = book.reviews[username];

  if (userReview) {
    // レビューを削除
    delete book.reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  } else {
    return res.status(404).json({ message: "Review not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
