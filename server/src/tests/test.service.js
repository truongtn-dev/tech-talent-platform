import CodingTest from "./test.model.js";
import Submission from "./submission.model.js";

export const createTest = async (data, user) => {
  if (!["INTERVIEWER", "RECRUITER", "ADMIN"].includes(user.role)) {
    throw new Error("Permission denied");
  }
  return CodingTest.create({ ...data, createdBy: user.userId });
};

export const getTests = async () => {
  return CodingTest.find().sort({ createdAt: -1 });
};

export const getTestById = async (id) => {
  return CodingTest.findById(id);
};

export const submitCode = async (data, user) => {
  if (user.role !== "CANDIDATE") {
    throw new Error("Only candidate can submit");
  }

  // MVP: chưa chấm code thật, để score = 0
  return Submission.create({
    testId: data.testId,
    candidateId: user.userId,
    sourceCode: data.sourceCode,
    language: data.language,
    score: 0,
    runtime: 0,
  });
};
