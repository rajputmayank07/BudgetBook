import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  category_id: { type: String, unique: true },
  category_name: String,
  category_created_at: String,
  category_limit: Number,
  category_color: String,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

export default mongoose.model('Category', categorySchema);
