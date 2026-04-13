import Follow from "../models/Follow.js";

export const createFollow = async (followerId, followingId) => {
  const follow = new Follow({ follower: followerId, following: followingId });
  return await follow.save();
};

export const deleteFollow = async (followerId, followingId) => {
  return await Follow.findOneAndDelete({ follower: followerId, following: followingId });
};

export const findOne = async (followerId, followingId) => {
  return await Follow.findOne({ follower: followerId, following: followingId }).lean();
};

export const getFollowers = async (userId, skip, limit) => {
  return await Follow.find({ following: userId })
    .populate("follower", "username avatar bio")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();
};

export const getFollowing = async (userId, skip, limit) => {
  return await Follow.find({ follower: userId })
    .populate("following", "username avatar bio")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();
};

export const countFollowers = async (userId) => {
  return await Follow.countDocuments({ following: userId });
};

export const countFollowing = async (userId) => {
  return await Follow.countDocuments({ follower: userId });
};
