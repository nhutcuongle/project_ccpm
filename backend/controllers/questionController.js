import * as questionRepo from "../repositories/questionRepository.js";
import * as hashtagRepo from "../repositories/hashtagRepository.js";
import { cloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

// [POST] /api/questions
export const createQuestion = async (req, res) => {
  try {
    const { title, content, hashtags } = req.body;
    const authorId = req.user._id;

    // Xử lý ảnh (nếu có upload qua multer-cloudinary)
    const images = req.files ? req.files.map((file) => file.path) : [];

    // Xử lý hashtags
    let hashtagIds = [];
    if (hashtags) {
        // Nếu truyền mảng (JSON) hoặc chuỗi ngăn cách bởi dấu phẩy
        const hashtagNames = Array.isArray(hashtags) 
            ? hashtags 
            : hashtags.split(",").map(h => h.trim());
        
        hashtagIds = await hashtagRepo.upsertMany(hashtagNames);
    }

    const question = await questionRepo.create({
      title,
      content,
      images,
      author: authorId,
      hashtags: hashtagIds,
    });

    res.status(201).json({
      success: true,
      data: question,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [GET] /api/questions
export const getQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 10, hashtag, search, sort = "latest" } = req.query;
    const skip = (page - 1) * limit;

    const filter = { approved: true }; // Mặc định chỉ lấy bài đã duyệt

    // Lọc theo hashtag (tên hashtag)
    if (hashtag) {
      const hashtagDoc = await hashtagRepo.findByName(hashtag);
      if (hashtagDoc) {
        filter.hashtags = hashtagDoc._id;
      } else {
        // Nếu không tìm thấy hashtag, trả về mảng rỗng
        return res.json({ success: true, data: [], total: 0 });
      }
    }

    // Tìm kiếm text cơ bản
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    // Sắp xếp
    let sortQuery = { createdAt: -1 };
    if (sort === "oldest") sortQuery = { createdAt: 1 };
    if (sort === "popular") sortQuery = { score: -1, answersCount: -1 };

    const questions = await questionRepo.findPaginated(filter, skip, parseInt(limit), sortQuery);
    const total = await questionRepo.count(filter);

    res.json({
      success: true,
      data: questions,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [GET] /api/questions/:id
export const getQuestionById = async (req, res) => {
  try {
    const question = await questionRepo.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: "Không tìm thấy câu hỏi" });
    }
    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [PUT] /api/questions/:id
export const updateQuestion = async (req, res) => {
  try {
    const { title, content, hashtags } = req.body;
    const questionId = req.params.id;
    const userId = req.user._id;

    const question = await questionRepo.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: "Không tìm thấy câu hỏi" });
    }

    // Kiểm tra quyền (Tác giả hoặc Admin)
    if (question.author._id.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Bạn không có quyền sửa câu hỏi này" });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    
    // Nếu có cập nhật hashtags (giản lược: coi như thay thế toàn bộ)
    if (hashtags) {
        const hashtagNames = Array.isArray(hashtags) 
            ? hashtags 
            : hashtags.split(",").map(h => h.trim());
        updateData.hashtags = await hashtagRepo.upsertMany(hashtagNames);
    }

    const updatedQuestion = await questionRepo.updateById(questionId, updateData);

    res.json({ success: true, data: updatedQuestion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [DELETE] /api/questions/:id
export const deleteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const userId = req.user._id;

    const question = await questionRepo.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: "Không tìm thấy câu hỏi" });
    }

    // Kiểm tra quyền (Tác giả hoặc Admin)
    if (question.author._id.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Bạn không có quyền xóa câu hỏi này" });
    }

    // Xóa ảnh trên Cloudinary (nếu có)
    if (question.images && question.images.length > 0) {
        for (const imageUrl of question.images) {
            const publicId = imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`qna-images/${publicId}`);
        }
    }

    await questionRepo.deleteById(questionId);

    res.json({ success: true, message: "Đã xóa câu hỏi thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
