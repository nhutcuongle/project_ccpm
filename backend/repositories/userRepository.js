import User from "../models/User.js";

export const findByEmail = async (email) => {
  return await User.findOne({ email });
};

export const findByUsername = async (username) => {
  return await User.findOne({ username });
};

export const findByIdentifier = async (identifier) => {
  return await User.findOne({ identifier });
};

export const findByIdentifierLean = async (identifier, select = "") => {
  let query = User.findOne({ identifier });
  if (select) query = query.select(select);
  return await query.lean();
};

export const searchUsers = async (searchTerm, limit = 5) => {
  return await User.find({
    $or: [
      { username: { $regex: searchTerm, $options: "i" } },
      { identifier: { $regex: searchTerm, $options: "i" } }
    ]
  })
  .select("username identifier avatar")
  .limit(limit)
  .lean();
};


export const findById = async (id) => {
  return await User.findById(id);
};

export const findByIdLean = async (id, select = "") => {
  let query = User.findById(id);
  if (select) query = query.select(select);
  return await query.lean();
};

export const create = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

export const updateById = async (id, updateData) => {
  return await User.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

export const findPaginated = async (filter, skip, limit) => {
  return await User.find(filter)
    .select("-password")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();
};

export const count = async (filter) => {
  return await User.countDocuments(filter);
};

export const deleteById = async (id) => {
  return await User.findByIdAndDelete(id);
};
