import * as adminUserService from "../services/adminUserService.js";

export const getAllUsers = async (req, res) => {
  try {
    const data = await adminUserService.getAllUsersLogic(req.user.id, req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách người dùng", error: err.message });
  }
};

export const toggleDisableUser = async (req, res) => {
  try {
    const user = await adminUserService.toggleDisableUserLogic(req.params.id);
    res.json({ message: `Đã ${user.isDisabled ? "vô hiệu hóa" : "kích hoạt lại"}.`, user });
  } catch (err) {
    if (err.message === "USER_NOT_FOUND") return res.status(404).json({ message: "Không tìm thấy." });
    if (err.message === "CANNOT_MODIFY_ADMIN") return res.status(403).json({ message: "Không thể khóa Admin." });
    res.status(500).json({ message: "Lỗi cập nhật.", error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await adminUserService.deleteUserLogic(req.params.id);
    res.json({ message: "Xóa thành công." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa.", error: err.message });
  }
};


