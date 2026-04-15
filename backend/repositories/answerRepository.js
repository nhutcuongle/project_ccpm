import Answer from "../models/Answer.js";

export const count = async (filter = {}) => {
  return await Answer.countDocuments(filter);
};

export const findPaginated = async (filter, skip, limit, sort = { createdAt: -1 }) => {
  return await Answer.find(filter)
    .populate("author", "username avatar")
    .populate("question", "title")
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
};

export const deleteById = async (id) => {
  return await Answer.findByIdAndDelete(id);
};
