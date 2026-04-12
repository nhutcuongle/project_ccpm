import axiosClient from "./axiosClient";

const answerService = {
  getAnswers: async (questionId) => {
    const response = await axiosClient.get(`/answers?questionId=${questionId}`);
    return response.data;
  },
  createAnswer: async (data) => {
    const response = await axiosClient.post("/answers", data);
    return response.data;
  },
  updateAnswer: async (id, data) => {
    const response = await axiosClient.put(`/answers/${id}`, data);
    return response.data;
  },
  deleteAnswer: async (id) => {
    const response = await axiosClient.delete(`/answers/${id}`);
    return response.data;
  },
};

export default answerService;
