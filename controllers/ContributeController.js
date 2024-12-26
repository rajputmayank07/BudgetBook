import User from '../backend/src/models/User.js';

export const contributor = async (req, res) => {
  const email = req.body.email;

  try {
    // Find user by email
    const user = await User.findOne({ user_email: email });
    if (user) {
      return res.status(200).json({ success: true, message: "User found!", username: user.user_name });
    }

    res.status(400).json({ success: false, message: "User not found!" });
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const contributeAmount = async (req, res) => {
  const sender_id = req.body.user_id;
  const email = req.body.email;
  const amount = parseFloat(req.body.amount);

  try {
    // Find the receiver by email
    const receiver = await User.findOne({ user_email: email });
    if (!receiver) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    // Find the sender by user_id (MongoDB ObjectId)
    const sender = await User.findById(sender_id);
    if (!sender) {
      return res.status(404).json({ success: false, message: "Sender not found!" });
    }

    // Check sender balance
    if (parseFloat(sender.user_balance) < amount) {
      return res.status(300).json({
        success: false,
        message: "User doesn't have sufficient balance!",
      });
    }

    // Update balances
    sender.user_balance = parseFloat(sender.user_balance) - amount;
    receiver.user_balance = parseFloat(receiver.user_balance) + amount;

    // Save changes
    await sender.save();
    await receiver.save();

    return res.status(200).json({ success: true, message: "Balance updated!" });
  } catch (error) {
    console.error("Error during contribution:", error);
    return res.status(500).json({ success: false, message: "Internal server error!" });
  }
};
