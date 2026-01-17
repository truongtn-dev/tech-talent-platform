import Profile from "./profile.model.js";

export const getMyProfile = async (user) => {
  return Profile.findOne({ userId: user.userId });
};

export const upsertProfile = async (data, user) => {
  return Profile.findOneAndUpdate({ userId: user.userId }, data, {
    new: true,
    upsert: true,
  });
};

export const getProfileByUserId = async (userId) => {
  return Profile.findOne({ userId });
};
