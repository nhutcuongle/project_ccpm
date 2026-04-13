import axiosClient from "./axiosClient";

export const followUser = async (userId) => {
  const res = await axiosClient.post(`/follow/${userId}`);
  return res.data;
};

export const unfollowUser = async (userId) => {
  const res = await axiosClient.delete(`/follow/${userId}`);
  return res.data;
};

export const getFollowStatus = async (userId) => {
  const res = await axiosClient.get(`/follow/status/${userId}`);
  return res.data;
};

export const getFollowers = async (userId, page = 1, limit = 20) => {
  const res = await axiosClient.get(`/follow/followers/${userId}`, {
    params: { page, limit },
  });
  return res.data;
};

export const getFollowing = async (userId, page = 1, limit = 20) => {
  const res = await axiosClient.get(`/follow/following/${userId}`, {
    params: { page, limit },
  });
  return res.data;
};
