const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Check if a user with the given username already exists
const doesExist = (username) => {
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  // Check if both username and password are provided
  if (username && password) {
    // Check if the user does not already exist
    if (!doesExist(username)) {
      // Add the new user to the users array
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  // Return error if username or password is missing
  return res.status(404).json({ message: "Unable to register user." });
});

// Async function to get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    const bookList = await getBooks(); // 本のリストを取得
    res.send(JSON.stringify(bookList, null, 4)); // 本のリストをJSON形式で返す
  } catch (error) {
    res.status(500).json({ message: "Error retrieving book list" }); // エラーが発生した場合、500エラーを返す
  }
});

// Function to simulate fetching books with a Promise
function getBooks() {
  return new Promise((resolve, reject) => {
    // Simulate async operation
    setTimeout(() => {
      if (books) {
        resolve(books); // 本のリストを解決
      } else {
        reject("No books found"); // 本が見つからない場合、エラーを拒否
      }
    }, 1000); // 1秒の遅延をシミュレート
  });
}

// Get book details based on ISBN using async-await
public_users.get("/isbn/:isbn", async function (req, res) {
  const isbn = req.params.isbn; // リクエストパラメータからISBNを取得

  try {
    const book = await getBookByISBN(isbn); // ISBNに基づいて本を取得
    res.json(book); // 本が見つかった場合、その詳細を返す
  } catch (error) {
    res.status(404).json({ message: error }); // 本が見つからない場合、404エラーを返す
  }
});

// Function to simulate fetching a book by ISBN with a Promise
function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    const book = books[isbn]; // ISBNに基づいて本を検索
    if (book) {
      resolve(book); // 本が見つかった場合、解決
    } else {
      reject("Book not found"); // 本が見つからない場合、エラーを拒否
    }
  });
}

// Get book details based on author using Promise
public_users.get("/author/:author", async function (req, res) {
  const author = req.params.author; // リクエストパラメータから著者名を取得

  try {
    const booksByAuthor = await getBooksByAuthor(author); // 著者に基づいて本を取得
    res.json(booksByAuthor); // 著者に基づく本が見つかった場合、そのリストを返す
  } catch (error) {
    res.status(404).json({ message: error }); // 本が見つからない場合、404エラーを返す
  }
});

// Function to simulate fetching books by author with a Promise
function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    const booksByAuthor = []; // 著者に基づく本のリストを格納する配列

    // 'books'オブジェクトのすべてのキーを取得し、反復処理
    for (let isbn in books) {
      if (books[isbn].author === author) {
        // 著者が一致するか確認
        booksByAuthor.push(books[isbn]); // 一致する場合、配列に追加
      }
    }

    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor); // 著者に基づく本が見つかった場合、解決
    } else {
      reject("Books by this author not found"); // 見つからない場合、エラーを拒否
    }
  });
}

// Get all books based on title using Promise
public_users.get("/title/:title", async function (req, res) {
  const title = req.params.title; // リクエストパラメータからタイトルを取得

  try {
    const booksByTitle = await getBooksByTitle(title); // タイトルに基づいて本を取得
    res.json(booksByTitle); // タイトルに基づく本が見つかった場合、そのリストを返す
  } catch (error) {
    res.status(404).json({ message: error }); // 本が見つからない場合、404エラーを返す
  }
});

// Function to simulate fetching books by title with a Promise
function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    const booksByTitle = []; // タイトルに基づく本のリストを格納する配列

    // 'books'オブジェクトのすべてのキーを取得し、反復処理
    for (let isbn in books) {
      if (books[isbn].title === title) {
        // タイトルが一致するか確認
        booksByTitle.push(books[isbn]); // 一致する場合、配列に追加
      }
    }

    if (booksByTitle.length > 0) {
      resolve(booksByTitle); // タイトルに基づく本が見つかった場合、解決
    } else {
      reject("Books with this title not found"); // 見つからない場合、エラーを拒否
    }
  });
}

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn; // リクエストパラメータからISBNを取得
  const book = books[isbn]; // ISBNに基づいて本を検索

  if (book && book.reviews) {
    res.json(book.reviews); // 本のレビューが見つかった場合、その詳細を返す
  } else {
    res.status(404).json({ message: "Reviews not found for this book" }); // レビューが見つからない場合、404エラーを返す
  }
});

module.exports.general = public_users;
