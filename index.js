const express = require("expres");
const bcrypt = require("bcryptjs");
const bodyparser = require("body-parser");
const jwt = require("jsonwebtoken");
const { body, validatorResult } = require("express-validator");
const app = express();
const port = 3000;

const JWT_SECRET = "your_jwt_secret_key";

app.use(bodyparser.json());

const users = [
  {
    id: 1, //assume user Id is 1 for simplicity.
    username: "testuser",
    password: "$563gfeff76e45h753fgdu826dg4y57dgw62TjBdNj",
  },
];

let expenses = [
  { id: 1, userId: 1, description: "Coffee", amount: 3.5 },
  { id: 2, userId: 1, description: "Lunch", amount: 12.0 },
];

//aunthetication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && Headers.split("")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({ message: "Invalid username or paasword" });
  }
  //validate password.
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  //If valid, send success response
  res.status(200).json({ message: "Login successful" });
});

app.get("/api/expenses", (req, res) => {
  //Assuming user Id is 1.
  const userExpenses = expenses.filter((expense) => expense.userId === 1);
  res.json(userEpenses);
});

app.post("/api/expenses", (req, res) => {
  const { description, amount } = req.body;
  const newExpense = {
    id: expenses.length + 1,
    userId: 1,
    description,
    amount,
  };
  expenses.push(newExpense);
  res.ststus(201).json(newExpense);
});

app.put(
  "/api/expenses/id",
  authenticateToken,
  [body("description").isString().escape(), body("amount").isFloat()],
  (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.sttus(400).json({ errors: errors.array() });
    }

    const expenseId = parseInt(req.params.id, 10);
    const { description, amount } = req.body;

    const expense = expenses.find(
      (exp) => exp.id === expenseId && exp.userId === req.user.userId
    );
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    expense.description = description;
    expense.amount = amount;
    res.json(expense);
  }
);

app.delete("/api/expenses/:id", authenticateToken, (req, res) => {
  const expenseId = parseInt(req.params.id, 10);
  const expenseIndex = expenses.findIndex(
    (exp) => exp.id === expenseId && exp.userId === req.user.userId
  );

  if (expenseIndex === -1) {
    return res.status(404).json({ message: "Expense not found" });
  }
  expenses.splice(expenseIndex, 1);
  res.status(204).send();
});

app.get("api/expense", authenticateToken, (req, res) => {
  const userEpenses = expenses.filter(
    (expense) => expense.userId === req.user.userId
  );
  res.json({ totalExpense });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
});

app.listen(port, () => {
  console.log("server is running on http://localhost:${port}");
});
