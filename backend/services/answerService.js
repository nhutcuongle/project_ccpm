import Answer from "../models/Answer.js";
import Question from "../models/Question.js";
import Vote from "../models/Vote.js";

// Tạo câu trả lời mới
export const createAnswer = async (questionId, content, authorId, images = [], parentAnswerId = null) => {
  const newAnswer = new Answer({
    content,
    question: questionId,
    author: authorId,
    images,
    parentAnswer: parentAnswerId
  });

  const savedAnswer = await newAnswer.save();

  // Tăng answersCount lên +1 ở Question
  await Question.findByIdAndUpdate(questionId, {
    $inc: { answersCount: 1 }
  });

  return savedAnswer;
};

// Sửa câu trả lời
export const updateAnswer = async (answerId, authorId, updates) => {
  const answer = await Answer.findById(answerId);
  
  if (!answer) {
    throw new Error("Câu trả lời không tồn tại");
  }

  // Kiểm tra quyền (chỉ người tạo mới được sửa) - chưa tính role Admin ở đây, nếu cần admin có thể sửa chung logic check
  if (answer.author.toString() !== authorId) {
    throw new Error("Không có quyền chỉnh sửa");
  }

  // Cập nhật các field, chặn tự ý sửa score, approved
  const allowedUpdates = ["content", "images"];
  allowedUpdates.forEach(field => {
    if (updates[field] !== undefined) {
      answer[field] = updates[field];
    }
  });

  await answer.save();
  return answer;
};

// Xoá câu trả lời (Xoá thật trong database)
export const deleteAnswer = async (answerId, authorId) => {
  const answer = await Answer.findById(answerId);
  if (!answer) {
    throw new Error("Câu trả lời không tồn tại");
  }

  if (answer.author.toString() !== authorId) {
     throw new Error("Không có quyền xoá");
  }

  // Lấy ID question để giảm số lượng trả lời
  const questionId = answer.question;

  // Cân nhắc: Xoá cả những cmt con của câu trả lời này (parentAnswer: answerId) nếu có parentAnswer
  const childAnswersCount = await Answer.countDocuments({ parentAnswer: answerId });
  await Answer.deleteMany({ parentAnswer: answerId });

  await Answer.findByIdAndDelete(answerId);

  // Cập nhật lại số câu trả lời của Parent Question
  // 1 (số lượng answer gốc bị xoá) + số lượng các comment con bị xoá theo
  await Question.findByIdAndUpdate(questionId, {
     $inc: { answersCount: -(1 + childAnswersCount) }
  });

  return true;
};

// Lấy toàn bộ câu trả lời của 1 câu hỏi (kèm userVote nếu có)
export const getAnswersByQuestionId = async (questionId, userId = null) => {
  const answers = await Answer.find({ question: questionId, parentAnswer: null })
    .populate("author", "username identifier avatar")
    .sort({ createdAt: 1 });

  const answerIds = answers.map(a => a._id);
  
  // Lấy các comment con
  const childAnswers = await Answer.find({ parentAnswer: { $in: answerIds } })
    .populate("author", "username identifier avatar")
    .sort({ createdAt: 1 });

  // Lấy userVotes nếu có
  let voteMap = {};
  if (userId) {
    const allAnswerIds = [...answerIds, ...childAnswers.map(c => c._id)];
    const userVotes = await Vote.find({
      targetType: "answer",
      targetId: { $in: allAnswerIds },
      user: userId
    });
    voteMap = userVotes.reduce((acc, vote) => {
      acc[vote.targetId.toString()] = vote.voteType;
      return acc;
    }, {});
  }

  // Tổ chức lại dữ liệu: Answer -> Comments
  return answers.map(a => {
    const answerObj = a.toObject();
    answerObj.userVote = voteMap[a._id.toString()] || null;
    answerObj.comments = childAnswers
      .filter(c => c.parentAnswer.toString() === a._id.toString())
      .map(c => {
        const commentObj = c.toObject();
        commentObj.userVote = voteMap[c._id.toString()] || null;
        return commentObj;
      });
    return answerObj;
  });
};
