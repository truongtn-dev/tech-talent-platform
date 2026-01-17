import * as authService from "./auth.service.js";

export const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await authService.register({ email, password, role });

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
