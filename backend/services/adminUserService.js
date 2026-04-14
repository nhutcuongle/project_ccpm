import * as userRepository from "../repositories/userRepository.js";


export const isTargetAdmin = async (userId) => {
  const user = await userRepository.findById(userId);
  return user?.role === "admin";
};

export const getAllUsersLogic = async (currentAdminId, query) => {
  const { page = 1, limit = 10, identifier = "" } = query;
  const filter = { _id: { $ne: currentAdminId } };

  if (identifier) {
    filter.identifier = { $regex: identifier, $options: "i" };
  }

  const [users, total] = await Promise.all([
    userRepository.findPaginated(filter, (page - 1) * limit, Number(limit)),
    userRepository.count(filter)
  ]);

  return { users, total };
};


export const toggleDisableUserLogic = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");
  if (user.role === "admin") throw new Error("CANNOT_MODIFY_ADMIN");

  const updatedUser = await userRepository.updateById(userId, { isDisabled: !user.isDisabled });
  return updatedUser;
};

export const deleteUserLogic = async (userId) => {
  const isAdmin = await isTargetAdmin(userId);
  if (isAdmin) throw new Error("CANNOT_MODIFY_ADMIN");

  const user = await userRepository.deleteById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");
};
