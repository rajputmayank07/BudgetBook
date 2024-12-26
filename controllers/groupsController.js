
import User from '../backend/src/models/User.js';
import Group from '../backend/src/models/Group.js';
import crypto from 'crypto';

//---------------Creating a controller to all groups of the person--------------------//
export const allGroups = async (req, res) => {
  try {
    const userID = req.body.user_id;
    const groups = await Group.find({ user_id: userID });

    if (groups.length > 0) {
      const groupDetails = groups.map(group => ({
        group_id: group.group_id,
        group_name: group.group_name
      }));

      res.status(200).send({
        success: true,
        message: "Groups Fetched Successfully",
        groupDetails
      });
    } else {
      res.status(400).send({ message: "Error in loading the groups of the user" });
    }
  } catch (error) {
    res.status(500).send({
      error: error.message,
      message: "Internal Server Error in getting the user groups",
    });
  }
};

export const splitFunction = async (req, res) => {
  const user_id = req.body.user_id;
  const data = req.body.updatedBalances;

  try {
    for (const userId in data) {
      if (data.hasOwnProperty(userId)) {
        const balanceChange = parseFloat(data[userId]);
        const user = await User.findById(userId);
        if (!user) continue; // If user not found, skip or handle error
        user.user_balance = parseFloat(user.user_balance) + balanceChange;
        await user.save();
      }
    }

    const updatedUser = await User.findById(user_id);
    const balance_to_send = updatedUser ? updatedUser.user_balance : 0;

    res.status(200).json({
      success: true,
      message: "Successfully split the amount!",
      newBalance: balance_to_send,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error occurred while splitting the amount",
    });
  }
};



//-------Controller for getting the members of a particular group------------//
export const memberInAGroup = async (req, res) => {
  try {
    const groupID = req.body.group_id;

    // Find all group memberships for this group_id
    const groupMemberships = await Group.find({ group_id: groupID });
    if (groupMemberships.length === 0) {
      return res.status(400).send({ message: "No members found for this group" });
    }

    // For each membership, fetch the user_name
    const members = [];
    for (const membership of groupMemberships) {
      const user = await User.findById(membership.user_id);
      if (user) {
        members.push({ user_id: membership.user_id, user_name: user.user_name });
      }
    }

    res.status(200).send({
      success: true,
      message: "Members of a group Fetched Successfully",
      groupID: groupID,
      members: members,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: error.message,
      message: "Internal Server Error in getting the members of a group",
    });
  }
};


//----------Controller for assigning amount paid by a particular user ------------
export const amountPaidByAUserInAGroup = async (req, res) => {
  try {
    const groupID = req.body.group_id;
    const paymentDetails = req.body.updatedBalances; // Array of { user_id, pool_amount }

    // Check if group exists
    const groupMemberships = await Group.find({ group_id: groupID });
    if (groupMemberships.length === 0) {
      return res.status(400).send({ message: "Error in Setting the Pool Amount of the Members" });
    }

    // Update pool_amount for each member
    await Promise.all(paymentDetails.map(member => {
      return Group.findOneAndUpdate(
        { group_id: groupID, user_id: member.user_id },
        { pool_amount: member.pool_amount }
      );
    }));

    res.status(200).send({
      success: true,
      message: "Pool Amount Added For All Members Successfully",
    });
  } catch (error) {
    console.error("Error updating pool amount:", error);
    res.status(500).send({
      error: error.message,
      message: "Internal Server Error, Error in setting the amount of each member in a group",
    });
  }
};


//-------Controller to check the Average of the group----------
export const averageOfTheGroup = async (req, res) => {
  try {
    const groupID = req.body.group_id;

    // Aggregate to find the average pool_amount where balance_amount != -1
    const result = await Group.aggregate([
      { $match: { group_id: groupID, balance_amount: { $ne: -1 } } },
      { $group: { _id: null, avg: { $avg: "$pool_amount" } } }
    ]);

    if (result.length > 0) {
      res.status(200).send({
        success: true,
        message: "Average of the group is calculated successfully",
        averageValue: result[0].avg,
      });
    } else {
      res.status(400).send({
        message: "No data found to calculate average",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: error.message,
      message: "Internal Server Error, Error in Calculating the average",
    });
  }
};


//-------Controller for changing status of payment and amount left ---------
export const changeRemainingBalanceAndStatus = async (req, res) => {
  try {
    const averageValue = parseFloat(req.body.average);
    const groupID = req.body.group_id;
    const userID = req.body.user_id;

    const membership = await Group.findOne({ group_id: groupID, user_id: userID });
    if (!membership) {
      return res.status(404).send({ message: "Group membership not found" });
    }

    const poolAmount = membership.pool_amount;
    const diff = poolAmount - averageValue;

    if (poolAmount >= averageValue) {
      // No amount needs to be paid
      membership.status = 0;
      await membership.save();
      res.status(200).send({
        success: true,
        message: "No Amount need to be paid",
      });
    } else {
      // Pool amount less than average
      membership.status = 1;
      membership.balance_amount = diff;
      await membership.save();
      res.status(200).send({
        success: true,
        message: "Difference amount need to be paid",
        diff: diff,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: error.message,
      message: "Internal Server Error, Error in changing the remaining balance and status",
    });
  }
};


//-------Controller to check status of the Balance of a person in all the groups-------
export const checkStatusOfBalance = async (req, res) => {
  try {
    const userID = req.body.user_id;
    const groupIDs = req.body.groupIDs; // array of {group_id}

    const alertOnGroups = [];

    if (groupIDs && groupIDs.length > 0) {
      for (const group of groupIDs) {
        const membership = await Group.findOne({ user_id: userID, group_id: group.group_id });
        if (membership && membership.status === 1) {
          alertOnGroups.push(group);
        }
      }
      res.status(200).send({
        success: true,
        message: "The groups to be alerted are sent",
        alertOnGroups: alertOnGroups,
      });
    } else {
      res.status(400).send({
        message: "No groupIDs provided or error in checking the status",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: error.message,
      message: "Internal Server Error, Error in checking status of each member in each group",
    });
  }
};


// -------- Create a group -------- //
export const createGroup = async (req, res) => {
  const user_id = req.body.user_id;
  const group_name = req.body.group_name;

  try {
    const group_id = crypto.randomUUID();
    // Create a group membership for this user
    const newGroup = new Group({ group_id, group_name, user_id, pool_amount:0, status:0, balance_amount:0 });
    await newGroup.save();

    res.status(201).send({
      message: "Group created!",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message, message: "Error creating group" });
  }
};


//------Adding a member into already existing group--------//
export const addMemberGroup = async (req, res) => {
  const email = req.body.email;
  const group_id = req.body.group_id;
  const group_name = req.body.group_name;

  try {
    // Check if user is registered
    const user = await User.findOne({ user_email: email });
    if (!user) {
      return res.status(404).send({
        status: false,
        message: "User not in database!",
      });
    }

    // Check if user_id is already in group
    const existingMembership = await Group.findOne({ user_id: user._id, group_id });
    if (existingMembership) {
      return res.status(400).send({
        status: false,
        message: "User already present in group!",
      });
    }

    // Add user to group
    const newMember = new Group({ group_id, group_name, user_id: user._id, pool_amount:0, status:0, balance_amount:0 });
    await newMember.save();

    res.status(200).send({
      status: true,
      message: "Successfully added into group!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({error: error.message, message: "Error adding member to group"});
  }
};
