import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * Static institute details. Kept on the server (rather than hardcoded
 * only in the frontend) so contact/address/stat changes can be made
 * in one place and are consumable by any future client.
 *
 * @route   GET /api/institute
 * @access  Public
 */
export const getInstituteDetails = asyncHandler(async (req, res) => {
  const details = {
    name: "Future IT College",
    alternateName: "FUTURE IT COLLEGE VEERPURA & COMPUTER CENTER",
    tagline: "Learn Today. Lead Tomorrow.",
    establishedYear: 2016,
    address: {
      line1: "FUTURE IT COLLEGE VEERPURA & COMPUTER CENTER",
      city: "Aligarh",
      state: "Uttar Pradesh",
      pincode: "202142",
    },
    contact: {
      phones: ["9927444970", "6398842895"],
      email: "DCM20020@gmail.com",
      mapUrl: "https://maps.app.goo.gl/LMMnXY95ohxfgmHj8",
    },
    stats: {
      studentsTrained: 3000,
      professionalCourses: 20,
      yearsOfExcellence: 10,
      practicalLearningPercent: 100,
    },
  };

  return res.status(200).json(new ApiResponse(200, details));
});
