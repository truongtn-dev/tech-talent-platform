import * as authService from "./auth.service.js";

export const register = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName } = req.body;
    let avatar = "";
    if (req.file) {
      avatar = `${req.protocol}://${req.get("host")}/${req.file.path.replace(/\\/g, "/")}`;
    }

    const user = await authService.register({ email, password, role, avatar, firstName, lastName });

    res.status(201).json({
      message: "Register success",
      user,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    let avatar = "";
    if (req.file) {
      avatar = `${req.protocol}://${req.get("host")}/${req.file.path.replace(/\\/g, "/")}`;
    }
    if (!avatar) throw new Error("No file uploaded");

    const user = await authService.updateAvatar(req.user.userId, avatar);
    res.json({ message: "Avatar updated", avatar: user.avatar });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new Error("Current password and new password are required");
    }

    await authService.changePassword(req.user.userId, currentPassword, newPassword);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

