/* File: src/api/utils/seedAdmin.js */
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    const email = process.env.DEFAULT_ADMIN_EMAIL;
    const password = process.env.DEFAULT_ADMIN_PASSWORD;
    if (!email || !password) {
      console.warn(
        "DEFAULT_ADMIN_EMAIL or DEFAULT_ADMIN_PASSWORD not set; skipping admin seed."
      );
      return;
    }

    const admin = await User.findOne({ email });
    if (!admin) {
      await User.create({ email, password, role: "admin" });
      console.log("Default admin user created.");
      return;
    }

    // Reset admin password on startup to match .env (useful in dev)
    admin.password = password; // will be hashed by pre('save') hook
    await admin.save();
    console.log("Default admin password reset to match environment variables.");
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
};

module.exports = seedAdmin;
