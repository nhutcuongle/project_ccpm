import axiosClient from './axiosClient';

export const getTrendingHashtags = (limit = 10) => axiosClient.get(`/hashtags/trending?limit=${limit}`);
