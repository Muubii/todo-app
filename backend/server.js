require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "*" })); 
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "todo_db",
  port: process.env.DB_PORT || 3306,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL");
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];

    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({ message: "Login successful", user });
  });
});

app.post("/signup", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  db.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, password],
    (err, result) => {
      if (err) {
        console.error("❌ Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ message: "Signup successful", userId: result.insertId });
    }
  );
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT id, email FROM users WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(results[0]);
  });
});

app.put("/profile/email/:id", (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  db.query("UPDATE users SET email = ? WHERE id = ?", [email, id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Email updated successfully" });
  });
});

app.put("/profile/password/:id", (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: "Password is required" });

  db.query("UPDATE users SET password = ? WHERE id = ?", [password, id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Password updated successfully" });
  });
});

app.get("/todos", (req, res) => {
  db.query("SELECT * FROM todos", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

app.get("/todos/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM todos WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "Todo not found" });
    res.json(results[0]);
  });
});

app.post("/todos", (req, res) => {
  const { user_id, title, description } = req.body;
  if (!title || !user_id) return res.status(400).json({ message: "Title and user_id are required" });

  db.query("INSERT INTO todos (user_id, title, description) VALUES (?, ?, ?)", [user_id, title, description], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ todoId: result.insertId, message: "Todo created successfully" });
  });
});

app.put("/todos/:id", (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required" });

  db.query("UPDATE todos SET title = ?, description = ? WHERE id = ?", [title, description, id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Todo not found" });

    res.json({ message: "Todo updated successfully" });
  });
});

app.delete("/todos/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM todos WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Todo not found" });

    res.json({ message: "Todo deleted successfully" });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});

