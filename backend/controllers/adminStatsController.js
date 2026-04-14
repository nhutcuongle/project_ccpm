import * as userRepository from "../repositories/userRepository.js";
import * as questionRepository from "../repositories/questionRepository.js";
import * as answerRepository from "../repositories/answerRepository.js";

/**
 * Lấy số liệu thống kê tổng quan hệ thống
 */
export const getSystemStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalQuestions,
      totalAnswers,
      disabledUsers
    ] = await Promise.all([
      userRepository.count({}),
      questionRepository.count({}),
      answerRepository.count({}),
      userRepository.count({ isDisabled: true })
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: totalUsers - disabledUsers,
          disabled: disabledUsers
        },
        content: {
          questions: totalQuestions,
          answers: totalAnswers,
          total: totalQuestions + totalAnswers
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
