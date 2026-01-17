import * as service from "./interview.service.js";

export const scheduleInterview = async (req, res) => {
  try {
    const interview = await service.scheduleInterview(req.body, req.user);
    res.status(201).json(interview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const myInterviews = async (req, res) => {
  const interviews = await service.getMyInterviews(req.user);
  res.json(interviews);
};

export const completeInterview = async (req, res) => {
  try {
    const interview = await service.completeInterview(
      req.params.id,
      req.body,
      req.user,
    );
    res.json(interview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
