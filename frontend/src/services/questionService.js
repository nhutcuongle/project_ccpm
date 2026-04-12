import axiosClient from "./axiosClient";

const questionService = {
  getAllQuestions: async () => {
    const response = await axiosClient.get("/questions");
    return response.data;
  },
  getQuestionById: async (id) => {
    const response = await axiosClient.get(`/questions/${id}`);
    return response.data;
  },
  createQuestion: async (data) => {
    const response = await axiosClient.post("/questions", data);
    return response.data;
  },
};

export default questionService;
