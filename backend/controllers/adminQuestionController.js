import * as questionRepository from "../repositories/questionRepository.js";

/**
 * Lấy danh sách tất cả câu hỏi (Dành cho Admin)
 */
export const getAllQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } }
      ];
    }

    const [questions, total] = await Promise.all([
      questionRepository.findPaginated(filter, skip, Number(limit)),
      questionRepository.count(filter)
    ]);

    res.status(200).json({
      success: true,
      data: questions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Xóa câu hỏi (Admin cưỡng chế xóa)
 */
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuestion = await questionRepository.deleteById(id);

    if (!deletedQuestion) {
      return res.status(404).json({ success: false, message: "Không tìm thấy câu hỏi" });
    }

    res.status(200).json({
      success: true,
      message: "Đã xóa câu hỏi thành công",
      data: deletedQuestion
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
