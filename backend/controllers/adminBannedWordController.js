import FilteredWord from "../models/FilteredWord.js";

// [GET] /api/admin/banned-words
export const getBannedWords = async (req, res) => {
  try {
    const words = await FilteredWord.find().sort({ createdAt: -1 });
    res.json({ success: true, data: words });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [POST] /api/admin/banned-words
export const addBannedWord = async (req, res) => {
  try {
    const { word } = req.body;
    if (!word) {
      return res.status(400).json({ success: false, message: "Thiếu từ cần chặn" });
    }

    const existing = await FilteredWord.findOne({ word: word.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Từ này đã tồn tại trong danh sách" });
    }

    const newWord = await FilteredWord.create({ word: word.toLowerCase() });
    res.status(201).json({ success: true, data: newWord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [DELETE] /api/admin/banned-words/:id
export const deleteBannedWord = async (req, res) => {
  try {
    const { id } = req.params;
    await FilteredWord.findByIdAndDelete(id);
    res.json({ success: true, message: "Đã xóa từ cấm" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
