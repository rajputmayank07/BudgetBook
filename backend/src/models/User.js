import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  user_email: { type: String, unique: true, required: true },
  user_name: { type: String },
  user_password: { type: String, required: true },
  user_balance: { type: Number, required: true }
});

export default mongoose.model('User', userSchema);
