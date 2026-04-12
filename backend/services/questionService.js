import Question from "../models/Question.js";
import Vote from "../models/Vote.js";

export const createQuestion = async (data, authorId) => {
  const newQuestion = new Question({
    ...data,
    author: authorId,
  });
  return await newQuestion.save();
};

export const getQuestions = async (userId = null) => {
  const questions = await Question.find({ approved: true })
    .populate("author", "username identifier avatar")
    .sort({ createdAt: -1 });

  if (!userId) return questions;

  // Nếu có userId, tìm các vote của user này trên các bài đăng này
  const questionIds = questions.map((q) => q._id);
  const userVotes = await Vote.find({
    targetType: "question",
    targetId: { $in: questionIds },
    user: userId,
  });

  const voteMap = userVotes.reduce((acc, vote) => {
    acc[vote.targetId.toString()] = vote.voteType;
    return acc;
  }, {});

  return questions.map((q) => {
    const questionObj = q.toObject();
    questionObj.userVote = voteMap[q._id.toString()] || null;
    return questionObj;
  });
};

export const getQuestionById = async (id, userId = null) => {
  const question = await Question.findById(id).populate("author", "username identifier avatar");
  if (!question) throw new Error("Question not found");

  const questionObj = question.toObject();
  if (userId) {
    const vote = await Vote.findOne({
      targetType: "question",
      targetId: id,
      user: userId,
    });
    questionObj.userVote = vote ? vote.voteType : null;
  }
  return questionObj;
};
