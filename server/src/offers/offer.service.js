import Offer from "./offer.model.js";
import Application from "../applications/application.model.js";
import { createNotification } from "../notifications/notification.service.js";

export const createOffer = async (data, user) => {
  if (!["RECRUITER", "ADMIN"].includes(user.role)) {
    throw new Error("Permission denied");
  }

  const application = await Application.findById(data.applicationId);
  if (!application) {
    throw new Error("Application not found");
  }

  // Update application status
  application.status = "OFFER";
  application.timeline.push({ status: "OFFER" });
  await application.save();

  // Create offer
  const offer = await Offer.create({
    applicationId: data.applicationId,
    candidateId: application.candidateId,
    recruiterId: user.userId,
    position: data.position,
    salary: data.salary,
    startDate: data.startDate,
    note: data.note,
  });

  // Send notification AFTER offer created
  await createNotification({
    userId: application.candidateId,
    type: "OFFER",
    title: "New Job Offer",
    message: `You have received an offer for position ${data.position}`,
  });

  return offer;
};

export const myOffers = async (user) => {
  if (user.role !== "CANDIDATE") {
    throw new Error("Permission denied");
  }

  return Offer.find({ candidateId: user.userId }).sort({ createdAt: -1 });
};

export const respondOffer = async (offerId, status, user) => {
  const offer = await Offer.findById(offerId);
  if (!offer) throw new Error("Offer not found");

  if (offer.candidateId.toString() !== user.userId) {
    throw new Error("Permission denied");
  }

  offer.status = status;
  await offer.save();

  const application = await Application.findById(offer.applicationId);
  application.status = status === "ACCEPTED" ? "HIRED" : "REJECTED";
  application.timeline.push({ status: application.status });
  await application.save();

  return offer;
};
