import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./user.model.js";
import Profile from "../../profiles/profile.model.js";

const SALT_ROUNDS = 10;

export const register = async ({ email, password, role, avatar, firstName, lastName }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already exists");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    email,
    passwordHash,
    role,
    avatar,
  });

  // Create default profile
  const profile = await Profile.create({
    userId: user._id,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim() || email.split("@")[0],
  });

  // Generate token for auto-login
  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      profile: profile,
    },
  };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  const profile = await Profile.findOne({ userId: user._id });

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      profile: profile, // Include profile data
    },
  };
};

export const updateAvatar = async (userId, avatarPath) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { avatar: avatarPath },
    { new: true }
  );
  return user;
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }

  // Hash and update new password
  const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.passwordHash = newPasswordHash;
  await user.save();

  return { message: "Password changed successfully" };
};

