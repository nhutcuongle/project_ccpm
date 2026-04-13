import Question from "../models/Question.js";

export const create = async (questionData) => {
  const question = new Question(questionData);
  return await question.save();
};

export const findById = async (id) => {
  return await Question.findById(id).populate("author", "username avatar").populate("hashtags", "name");
};

export const updateById = async (id, updateData) => {
  return await Question.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

export const deleteById = async (id) => {
  return await Question.findByIdAndDelete(id);
};

export const findPaginated = async (filter, skip, limit, sort = { createdAt: -1 }) => {
  return await Question.find(filter)
    .populate("author", "username avatar")
    .populate("hashtags", "name")
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
};

export const count = async (filter) => {
  return await Question.countDocuments(filter);
};
