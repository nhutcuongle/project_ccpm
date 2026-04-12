import * as questionService from "../services/questionService.js";

export const createQuestion = async (req, res) => {
  try {
    const { title, content, images, hashtags } = req.body;
    const authorId = req.user.id;

    const newQuestion = await questionService.createQuestion(
      { title, content, images, hashtags },
      authorId
    );

    res.status(201).json({ message: "Đã đăng câu hỏi thành công", data: newQuestion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuestions = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const questions = await questionService.getQuestions(userId);
    res.status(200).json({ data: questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const question = await questionService.getQuestionById(id, userId);
    res.status(200).json({ data: question });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
