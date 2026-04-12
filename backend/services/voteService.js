import Vote from "../models/Vote.js";
import Question from "../models/Question.js";
import Answer from "../models/Answer.js";

export const handleVote = async (targetType, targetId, userId, voteType) => {
  const TargetModel = targetType === "question" ? Question : Answer;
  const target = await TargetModel.findById(targetId);

  if (!target) {
    throw new Error(`${targetType} không tồn tại`);
  }

  // Tìm session vote của user trên đối tượng
  const existingVote = await Vote.findOne({
    targetType,
    targetId,
    user: userId,
  });

  let scoreChange = 0;

  if (existingVote) {
    if (existingVote.voteType === voteType) {
      // Trùng loại vote (vd up rồi lại up) -> Hủy vote
      await Vote.findByIdAndDelete(existingVote._id);
      scoreChange = voteType === "up" ? -1 : 1;
    } else {
      // Đổi loại vote (từ up -> down)
      existingVote.voteType = voteType;
      await existingVote.save();
      // down -> up thì được 2, up -> down thì mất 2
      scoreChange = voteType === "up" ? 2 : -2; 
    }
  } else {
    // Tạo vote mới
    await Vote.create({
      targetType,
      targetId,
      user: userId,
      voteType,
    });
    scoreChange = voteType === "up" ? 1 : -1;
  }

  // Cập nhật tổng score trong bảng gốc mượt mà
  target.score += scoreChange;
  await target.save();

  // Kiểm tra userVote hiện tại (nếu vừa huỷ vote thì là null)
  const finalVote = await Vote.findOne({
    targetType,
    targetId,
    user: userId
  });

  return { 
    score: target.score, 
    userVote: finalVote ? finalVote.voteType : null 
  };
};
