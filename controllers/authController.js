import User from "../backend/src/models/User.js"
import Category from '../backend/src/models/Category.js';
import Expense from '../backend/src/models/Expense.js';

// Controller for user registration
export const registerController = async (req, res) => {
  const { email: user_email, username: user_name, password: user_password, balance: user_balance } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ user_email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists." });
    }

    // Create new user
    const newUser = new User({ user_email, user_password, user_name, user_balance });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully", user_id: newUser._id });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const loginController = async (req, res) => {
  const { email: user_email, password: user_password } = req.body;
  try {
    const user = await User.findOne({ user_email, user_password });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.status(200).json({
      user_id: user._id,
      balance: user.user_balance,
      user_name: user.user_name,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteUserController = async (req, res) => {
  try {
    const { user_email } = req.body;
    if (!user_email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if the user exists
    const user = await User.findOne({ user_email });
    if (!user) {
      return res.status(200).json({
        success: false,
        message: "Enter a valid User Email",
      });
    }

    // Delete the user
    await User.deleteOne({ user_email });

    return res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    console.log("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Sorry, an error occurred",
      error,
    });
  }
};

// get user details
export const userDetails = async (req, res) => {
  try {
    const user_id = req.params.id;
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user_name: user.user_name });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const setZeroBalance = async (req, res) => {
  const { email: user_email, zeroBalance } = req.body;
  try {
    const user = await User.findOne({ user_email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const initialBalance = user.user_balance;
    const newBalance = parseFloat(zeroBalance) + parseFloat(initialBalance);
    user.user_balance = newBalance;
    await user.save();

    res.status(200).json({
      message: "Successfully updated User Balance!",
      zeroBalance: parseFloat(zeroBalance),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  const { id: user_id, balance, budgets, expenses } = req.body;
  try {
    // Remove old data
    await Category.deleteMany({ user_id });
    await Expense.deleteMany({ user_id });

    // Insert new categories
    if (budgets && budgets.length > 0) {
      const categoryDocs = budgets.map(b => ({
        category_id: b.category_id,
        category_name: b.category_name,
        category_created_at: b.category_created_at,
        category_limit: b.category_limit,
        category_color: b.category_color,
        user_id: user_id
      }));
      await Category.insertMany(categoryDocs);
    }

    // Insert new expenses
    if (expenses && expenses.length > 0) {
      const expenseDocs = expenses.map(e => ({
        expense_id: e.expense_id,
        expense_name: e.expense_name,
        expense_created_at: e.expense_created_at,
        expense_amount: e.expense_amount,
        category_id: e.category_id,
        user_id: user_id
      }));
      await Expense.insertMany(expenseDocs);
    }

    // Update user's balance
    await User.findByIdAndUpdate(user_id, { user_balance: balance });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const fetchBudgets = async (req, res) => {
  const { user_id } = req.body;
  try {
    const user = await User.findById(user_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const budgets = await Category.find({ user_id });
    const expenses = await Expense.find({ user_id });

    res.status(200).json({
      message: "Found budgets from database!",
      budgets,
      expenses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
