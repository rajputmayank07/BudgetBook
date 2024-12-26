import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import Expense from "../backend/src/models/Expense.js";
import Category from "../backend/src/models/Category.js";

dotenv.config(); // Load environment variables from .env

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

export const getSpendingInsights = async (req, res) => {
  const { user_id } = req.body;

  try {
    // Fetch user's categories and expenses
    const categories = await Category.find({ user_id });
    const expenses = await Expense.find({ user_id });

    // Summarize spending data
    const categorySpend = {};
    expenses.forEach(expense => {
      const amount = parseFloat(expense.expense_amount) || 0;
      categorySpend[expense.category_id] = (categorySpend[expense.category_id] || 0) + amount;
    });

    // Create a user-friendly summary
    let prompt = "User spending summary:\n";
    categories.forEach(cat => {
      const spent = categorySpend[cat.category_id] || 0;
      prompt += `${cat.category_name}: $${spent}\n`;
    });
    prompt += "Based on the above spending, suggest 2-3 actionable financial tips to reduce expenses and save more money.";

    // Generate insights using Google's PaLM API
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // PaLM 2 model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const suggestions = response.text();

    res.status(200).json({ suggestions });
  } catch (error) {
    console.error("Error generating insights:", error.message);
    res.status(500).json({ error: "Failed to generate insights. Please try again later." });
  }
};
