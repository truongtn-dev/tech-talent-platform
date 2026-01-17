import CV from "./cv.model.js";

export const createCV = async (data, user) => {
  return CV.create({
    userId: user.userId,
    title: data.title,
    data: data.data,
  });
};

export const getMyCVs = async (user) => {
  return CV.find({ userId: user.userId }).sort({ createdAt: -1 });
};

export const getCVById = async (id) => {
  return CV.findById(id);
};

export const deleteCV = async (id, user) => {
  const cv = await CV.findById(id);
  if (!cv || cv.userId.toString() !== user.userId) {
    throw new Error("Permission denied");
  }
  await cv.deleteOne();
};
