import * as service from "./test.service.js";

export const createTest = async (req, res) => {
  try {
    const test = await service.createTest(req.body, req.user);
    res.status(201).json(test);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getTests = async (req, res) => {
  const tests = await service.getTests();
  res.json(tests);
};

export const getTestById = async (req, res) => {
  const test = await service.getTestById(req.params.id);
  if (!test) return res.status(404).json({ message: "Not found" });
  res.json(test);
};

export const submitCode = async (req, res) => {
  try {
    const submission = await service.submitCode(req.body, req.user);
    res.status(201).json(submission);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
