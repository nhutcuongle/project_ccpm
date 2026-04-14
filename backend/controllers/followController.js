import * as followService from "../services/followService.js";

export const followUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.userId;
    const result = await followService.followUser(followerId, followingId);
    res.json({ message: "Theo dõi thành công", data: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.userId;
    await followService.unfollowUser(followerId, followingId);
    res.json({ message: "Bỏ theo dõi thành công" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, limit } = req.query;
    const result = await followService.getFollowers(userId, Number(page), Number(limit));
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, limit } = req.query;
    const result = await followService.getFollowing(userId, Number(page), Number(limit));
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getFollowStatus = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.userId;
    const result = await followService.getFollowStatus(followerId, followingId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
