import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  expense_id: { type: String, unique: true },
  expense_name: { type: String, required: true },
  expense_created_at: String,
  expense_amount: Number,
  category_id: String, // We'll store the category_id (string). Alternatively, ref to Category if needed.
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

export default mongoose.model('Expense', expenseSchema);
