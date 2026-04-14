import * as followRepository from "../repositories/followRepository.js";
import * as userRepository from "../repositories/userRepository.js";

export const followUser = async (followerId, followingId) => {
  if (followerId === followingId) {
    throw new Error("Bạn không thể tự theo dõi chính mình");
  }

  const targetUser = await userRepository.findById(followingId);
  if (!targetUser) {
    throw new Error("Người dùng mục tiêu không tồn tại");
  }

  const existingFollow = await followRepository.findOne(followerId, followingId);
  if (existingFollow) {
    throw new Error("Bạn đã theo dõi người dùng này rồi");
  }

  return await followRepository.createFollow(followerId, followingId);
};

export const unfollowUser = async (followerId, followingId) => {
  const targetUser = await userRepository.findById(followingId);
  if (!targetUser) {
    throw new Error("Người dùng mục tiêu không tồn tại");
  }

  const deleted = await followRepository.deleteFollow(followerId, followingId);
  if (!deleted) {
    throw new Error("Bạn chưa theo dõi người dùng này");
  }

  return deleted;
};

export const getFollowers = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [followers, total] = await Promise.all([
    followRepository.getFollowers(userId, skip, limit),
    followRepository.countFollowers(userId),
  ]);

  return {
    followers: followers.map((f) => f.follower),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getFollowing = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [following, total] = await Promise.all([
    followRepository.getFollowing(userId, skip, limit),
    followRepository.countFollowing(userId),
  ]);

  return {
    following: following.map((f) => f.following),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getFollowStatus = async (followerId, followingId) => {
  const follow = await followRepository.findOne(followerId, followingId);
  return { isFollowing: !!follow };
};
