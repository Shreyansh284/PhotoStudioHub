/* File: src/api/utils/seedAdmin.js */
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({
      email: process.env.DEFAULT_ADMIN_EMAIL,
    });
    if (!adminExists) {
      await User.create({
        email: process.env.DEFAULT_ADMIN_EMAIL,
        password: process.env.DEFAULT_ADMIN_PASSWORD,
        role: "admin",
      });
      console.log("Default admin user created.");
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
};

module.exports = seedAdmin;
