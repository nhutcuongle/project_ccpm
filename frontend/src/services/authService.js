import axiosClient from './axiosClient';

export const register = (data) => axiosClient.post('/auth/register', data);
export const login = async (data) => {
  const res = await axiosClient.post('/auth/login', data);

  const token = res.data.token || res.data.accessToken; // tùy backend trả về tên gì
  if (token) {
    localStorage.setItem('token', token);
  }

  return res;
};

