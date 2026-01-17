import * as service from "./offer.service.js";

export const createOffer = async (req, res) => {
  try {
    const offer = await service.createOffer(req.body, req.user);
    res.status(201).json(offer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const myOffers = async (req, res) => {
  try {
    const offers = await service.myOffers(req.user);
    res.json(offers);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

export const respondOffer = async (req, res) => {
  try {
    const offer = await service.respondOffer(
      req.params.id,
      req.body.status,
      req.user,
    );
    res.json(offer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
