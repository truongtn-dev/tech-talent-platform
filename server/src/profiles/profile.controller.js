import * as service from "./profile.service.js";

export const myProfile = async (req, res) => {
  const profile = await service.getMyProfile(req.user);
  res.json(profile);
};

export const updateProfile = async (req, res) => {
  const profile = await service.upsertProfile(req.body, req.user);
  res.json(profile);
};

export const getProfileByUserId = async (req, res) => {
  const profile = await service.getProfileByUserId(req.params.userId);
  res.json(profile);
};
