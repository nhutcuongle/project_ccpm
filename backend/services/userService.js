import * as userRepository from "../repositories/userRepository.js";
import bcrypt from "bcrypt";

export const updateUserProfile = async (userId, data) => {
  const { username, address, phoneNumber, avatar, identifier, bio } = data;

  const user = await userRepository.findById(userId);
  if (!user) throw new Error("Người dùng không tồn tại");

  const updateData = {};

  if (identifier && identifier !== user.identifier) {
    const existedIdentifier = await userRepository.findByIdentifier(identifier);
    if (existedIdentifier) throw new Error("Mã định danh đã tồn tại");
    updateData.identifier = identifier;
  }

  if (username && username !== user.username) {
    const existedUsername = await userRepository.findByUsername(username);
    if (existedUsername) throw new Error("Tên người dùng đã tồn tại");
    updateData.username = username;
  }

  if (address !== undefined) updateData.address = address;
  if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
  if (avatar !== undefined) updateData.avatar = avatar;
  if (bio !== undefined) updateData.bio = bio;

  if (Object.keys(updateData).length > 0) {
    await userRepository.updateById(userId, updateData);
  }
  
  return await userRepository.findByIdLean(userId, "-password");
};

export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new Error("Người dùng không tồn tại");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error("Mật khẩu hiện tại không đúng");

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await userRepository.updateById(userId, { password: hashedPassword });
  return true;
};

export const getUserProfile = async (userId) => {
  const user = await userRepository.findByIdLean(userId, "-password");
  if (!user) throw new Error("Không tìm thấy người dùng");
  return user;
};
