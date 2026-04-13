import axiosClient from "./axiosClient";

export const getUserProfile = async (userId) => {
  const res = await axiosClient.get(`/user/${userId}`);
  return res.data;
};

export const getMyProfile = async () => {
  const res = await axiosClient.get("/user/me");
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await axiosClient.put("/user/update-profile", data);
  return res.data;
};

export const getUserByIdentifier = async (identifier) => {
  const res = await axiosClient.get(`/user/identifier/${identifier}`);
  return res.data;
};

export const searchUsers = async (query) => {
  const res = await axiosClient.get(`/user/search`, { params: { q: query } });
  return res.data.users || [];
};


