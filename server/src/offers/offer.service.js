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
  if (!Application.isValidTransition(application.status, "OFFER")) {
    throw new Error(`Invalid status transition: ${application.status} -> OFFER`);
  }
  application.status = "OFFER";
  application.history.push({ 
    status: "OFFER",
    updatedBy: user.userId,
    note: `Job offer created for ${data.position}`,
    at: new Date()
  });
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
  const nextStatus = status === "ACCEPTED" ? "OFFER_ACCEPTED" : "OFFER_DECLINED";

  if (!Application.isValidTransition(application.status, nextStatus)) {
    throw new Error(`Invalid status transition: ${application.status} -> ${nextStatus}`);
  }

  application.status = nextStatus;
  application.history.push({ 
    status: application.status,
    updatedBy: user.userId,
    note: `Candidate ${status.toLowerCase()} the offer`,
    at: new Date()
  });
  await application.save();

  return offer;
};
