import * as userRepository from "../repositories/userRepository.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const registerUser = async (data) => {
  const { username, email, password, identifier } = data;

  const [emailExists, usernameExists, identifierExists] = await Promise.all([
    userRepository.findByEmail(email),
    userRepository.findByUsername(username),
    userRepository.findByIdentifier(identifier)
  ]);

  if (emailExists) throw new Error("Email đã tồn tại.");
  if (usernameExists) throw new Error("Tên người dùng đã tồn tại.");
  if (identifierExists) throw new Error("Mã định danh đã tồn tại.");

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await userRepository.create({
    username,
    email,
    password: hashedPassword,
    identifier,
  });

  const token = generateToken(newUser);
  return { user: newUser, token };
};

export const loginUser = async (email, password) => {
  const user = await userRepository.findByEmail(email);
  if (!user) throw new Error("Không tìm thấy người dùng.");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Mật khẩu sai.");

  const token = generateToken(user);
  return { user, token };
};

