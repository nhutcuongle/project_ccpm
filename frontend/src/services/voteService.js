import axiosClient from "./axiosClient";

const voteService = {
  toggleVote: async (targetType, targetId, voteType) => {
    const response = await axiosClient.post("/votes", {
      targetType,
      targetId,
      voteType,
    });
    return response.data;
  },
};

export default voteService;
