const { cloudinary } = require("../config/cloudinary");
const catchAsync = require("../utils/catchAsync");

exports.getSignature = catchAsync(async (req, res) => {
  const { folder = "photo-studio" } = req.body || {};
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.API_SECRET
  );

  res.status(200).json({
    status: "success",
    data: {
      timestamp,
      signature,
      folder,
      cloudName: process.env.CLOUD_NAME,
      apiKey: process.env.API_KEY,
    },
  });
});
