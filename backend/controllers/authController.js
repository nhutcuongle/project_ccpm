import * as authService from "../services/authService.js";

export const register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: "Đăng ký thất bại.", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.message.includes("Không tìm thấy") ? 404 : 401).json({ 
      message: "Đăng nhập thất bại.", 
      error: err.message 
    });
  }
};
