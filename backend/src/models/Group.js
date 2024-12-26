import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  group_id: String,
  group_name: String,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pool_amount: Number,
  status: Number,
  balance_amount: Number
});

export default mongoose.model('Group', groupSchema);
