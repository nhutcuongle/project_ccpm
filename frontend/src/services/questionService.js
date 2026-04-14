import axiosClient from './axiosClient';

// Lấy danh sách câu hỏi theo params (page, limit, hashtag, search, sort)
export const getQuestions = (params) => axiosClient.get('/questions', { params });

// Lấy chi tiết một câu hỏi
export const getQuestionById = (id) => axiosClient.get(`/questions/${id}`);

// Tạo câu hỏi (hỗ trợ FormData vì có upload ảnh)
export const createQuestion = (formData) => 
  axiosClient.post('/questions', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

// Sửa câu hỏi
export const updateQuestion = (id, data) => axiosClient.put(`/questions/${id}`, data);

// Xóa câu hỏi
export const deleteQuestion = (id) => axiosClient.delete(`/questions/${id}`);
