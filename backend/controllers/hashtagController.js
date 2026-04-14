import * as hashtagRepo from "../repositories/hashtagRepository.js";

// [GET] /api/hashtags/trending
export const getTrendingHashtags = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const hashtags = await hashtagRepo.getTrending(limit);
    
    res.json({
      success: true,
      data: hashtags,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
