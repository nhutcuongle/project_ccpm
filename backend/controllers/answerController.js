import * as answerService from "../services/answerService.js";

// Tạo Comment / Answer
export const createAnswer = async (req, res) => {
  try {
    const { questionId, content, images, parentAnswerId } = req.body;
    const authorId = req.user.id; // Từ authenticate middleware

    // Nếu có parentAnswerId, thì nó là một Comment.
    // Nếu không, nó là Answer độc lập trên bài đăng.
    const newAnswer = await answerService.createAnswer(
      questionId,
      content,
      authorId,
      images,
      parentAnswerId
    );

    return res.status(201).json({
      message: parentAnswerId ? "Đã bình luận" : "Đã trả lời câu hỏi",
      data: newAnswer,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Sửa Comment / Answer
export const updateAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const authorId = req.user.id;
    const updates = req.body;

    const updatedAnswer = await answerService.updateAnswer(id, authorId, updates);
    return res.status(200).json({ message: "Sửa thành công", data: updatedAnswer });
  } catch (error) {
    if (error.message === "Không có quyền chỉnh sửa") {
      return res.status(403).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

// Xoá Comment / Answer
export const deleteAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const authorId = req.user.id;

    await answerService.deleteAnswer(id, authorId);
    return res.status(200).json({ message: "Xoá thành công" });
  } catch (error) {
    if (error.message === "Không có quyền xoá") {
      return res.status(403).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách câu trả lời
export const getAnswers = async (req, res) => {
  try {
    const { questionId } = req.query; // Nhận qua query: /api/answers?questionId=xxx
    const userId = req.user ? req.user.id : null;

    if (!questionId) {
      return res.status(400).json({ message: "Thiếu questionId" });
    }

    const answers = await answerService.getAnswersByQuestionId(questionId, userId);
    return res.status(200).json({ data: answers });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

