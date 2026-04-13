import Hashtag from "../models/Hashtag.js";

export const findByName = async (name) => {
  return await Hashtag.findOne({ name });
};

export const create = async (name) => {
  const hashtag = new Hashtag({ name });
  return await hashtag.save();
};

export const upsertMany = async (names) => {
  const bulkOps = names.map((name) => ({
    updateOne: {
      filter: { name: name.toLowerCase().trim() },
      update: { $inc: { postCount: 1 } },
      upsert: true,
    },
  }));
  
  if (bulkOps.length === 0) return [];
  
  await Hashtag.bulkWrite(bulkOps);
  
  // Trả về mảng IDs của các hashtags
  const hashtags = await Hashtag.find({ name: { $in: names.map(n => n.toLowerCase().trim()) } });
  return hashtags.map(h => h._id);
};

export const getTrending = async (limit = 10) => {
  return await Hashtag.find().sort({ postCount: -1 }).limit(limit).lean();
};

export const findByIds = async (ids) => {
    return await Hashtag.find({ _id: { $in: ids } });
};
