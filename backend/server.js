const express = require("express"); // imports express.js
const bodyParser = require("body-parser"); //  request bodies
const cors = require("cors"); //handlerequests
const sqlite3 = require("sqlite3").verbose(); // SQLite for database operations
const axios = require("axios"); // Axios for making API calls

const app = express(); // Initializes the Express app

app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Enable JSON parsing

// Initializes SQLite database
const db = new sqlite3.Database(":memory:");

// Creates tables for user accounts and transactions
db.serialize(() => {
  db.run(
    `CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      password TEXT,
      balance REAL DEFAULT 0
    )`
  );

  db.run(
    `CREATE TABLE transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT,
      amount REAL,
      currency TEXT,
      date TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`
  );
});

// Endpoint: Register a new user
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send("All fields are required");
  }

  db.run(
    `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
    [name, email, password],
    function (err) {
      if (err) {
        res.status(500).send("Error registering user");
      } else {
        res.status(201).send({ id: this.lastID });
      }
    }
  );
});


// Endpoint: Login user
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  db.get(
    `SELECT * FROM users WHERE email = ? AND password = ?`,
    [email, password],
    (err, user) => {
      if (err) {
        res.status(500).send("Error logging in");
      } else if (!user) {
        res.status(401).send("Invalid credentials");
      } else {
        res.status(200).send(user);
      }
    }
  );
});

// Fund Account
app.post("/fund-account", (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount) {
    return res.status(400).send("User ID and amount are required");
  }

  db.run(
    `UPDATE users SET balance = balance + ? WHERE id = ?`,
    [amount, userId],
    function (err) {
      if (err) {
        res.status(500).send("Error funding account");
      } else {
        // Record the transaction
        db.run(
          `INSERT INTO transactions (user_id, type, amount, currency, date) VALUES (?, 'fund', ?, 'PLN', datetime('now'))`,
          [userId, amount],
          function (err) {
            if (err) {
              res.status(500).send("Error recording transaction");
            } else {
              res.send({
                success: true,
                message: "Account funded successfully",
              });
            }
          }
        );
      }
    }
  );
});


// Buy Currency
app.post("/buy-currency", (req, res) => {
  const { userId, amount, currency } = req.body;

  if (!userId || !amount || !currency) {
    return res.status(400).send("User ID, amount, and currency are required");
  }

  const exchangeRate = 4.5; // Example rate for PLN
  const cost = amount * exchangeRate;

  db.get(`SELECT balance FROM users WHERE id = ?`, [userId], (err, user) => {
    if (err) {
      res.status(500).send("Error retrieving user balance");
    } else if (!user || user.balance < cost) {
      res.status(400).send("Insufficient balance");
    } else {
      db.run(
        `UPDATE users SET balance = balance - ? WHERE id = ?`,
        [cost, userId],
        function (err) {
          if (err) {
            res.status(500).send("Error deducting balance");
          } else {
            db.run(
              `INSERT INTO transactions (user_id, type, amount, currency, date) VALUES (?, 'buy', ?, ?, datetime('now'))`,
              [userId, amount, currency],
              function (err) {
                if (err) {
                  res.status(500).send("Error recording transaction");
                } else {
                  res.send({ success: true, message: "Currency purchased successfully" });
                }
              }
            );
          }
        }
      );
    }
  });
});

// Archived Exchange Rates
app.get("/exchange-rates/:date", async (req, res) => {
  const { date } = req.params;

  try {
    const response = await axios.get(
      `https://api.nbp.pl/api/exchangerates/tables/A/${date}/`
    );
    res.json(response.data[0].rates);
  } catch (error) {
    res.status(500).send("Error fetching archived exchange rates");
  }
});

// Endpoint: Fetch exchange rates from NBP API
app.get("/exchange-rates", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.nbp.pl/api/exchangerates/tables/A/"
    );
    res.json(response.data[0].rates);
  } catch (error) {
    res.status(500).send("Error fetching exchange rates");
  }
});

//endpoint 
// Endpoint: Get user by ID
app.get("/users/:id", (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, user) => {
    if (err) {
      res.status(500).send("Error fetching user");
    } else if (!user) {
      res.status(404).send("User not found");
    } else {
      res.status(200).send(user);
    }
  });
});
//endpoint exvhange logic 
// Buy Currency
app.post("/buy-currency", (req, res) => {
  const { userId, amount, currency } = req.body;

  if (!userId || !amount || !currency) {
    return res.status(400).send("User ID, amount, and currency are required");
  }

  const exchangeRate = 4.5; // Example rate for PLN
  const cost = amount * exchangeRate;

  db.get(`SELECT balance FROM users WHERE id = ?`, [userId], (err, user) => {
    if (err) {
      res.status(500).send("Error retrieving user balance");
    } else if (!user || user.balance < cost) {
      res.status(400).send("Insufficient balance");
    } else {
      db.run(
        `UPDATE users SET balance = balance - ? WHERE id = ?`,
        [cost, userId],
        function (err) {
          if (err) {
            res.status(500).send("Error deducting balance");
          } else {
            db.run(
              `INSERT INTO transactions (user_id, type, amount, currency, date) VALUES (?, 'buy', ?, ?, datetime('now'))`,
              [userId, amount, currency],
              function (err) {
                if (err) {
                  res.status(500).send("Error recording transaction");
                } else {
                  res.send({
                    success: true,
                    message: "Currency purchased successfully",
                    newBalance: user.balance - cost,
                  });
                }
              }
            );
          }
        }
      );
    }
  });
});

// Sell Currency
app.post("/sell-currency", (req, res) => {
  const { userId, amount, currency } = req.body;

  if (!userId || !amount || !currency) {
    return res.status(400).send("User ID, amount, and currency are required");
  }

  const exchangeRate = 4.5; 
  const earnings = amount * exchangeRate;

  db.get(`SELECT balance FROM users WHERE id = ?`, [userId], (err, user) => {
    if (err) {
      res.status(500).send("Error retrieving user balance");
    } else {
      db.run(
        `UPDATE users SET balance = balance + ? WHERE id = ?`,
        [earnings, userId],
        function (err) {
          if (err) {
            res.status(500).send("Error crediting balance");
          } else {
            db.run(
              `INSERT INTO transactions (user_id, type, amount, currency, date) VALUES (?, 'sell', ?, ?, datetime('now'))`,
              [userId, amount, currency],
              function (err) {
                if (err) {
                  res.status(500).send("Error recording transaction");
                } else {
                  res.send({
                    success: true,
                    message: "Currency sold successfully",
                    newBalance: user.balance + earnings,
                  });
                }
              }
            );
          }
        }
      );
    }
  });
});

// Gets Transactions for a User
app.get("/transactions/:userId", (req, res) => {
  const { userId } = req.params;

  db.all(
    `SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC`,
    [userId],
    (err, transactions) => {
      if (err) {
        res.status(500).send("Error retrieving transactions");
      } else {
        res.send(transactions);
      }
    }
  );
});

// Starts the server
const PORT = 8000; 
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});