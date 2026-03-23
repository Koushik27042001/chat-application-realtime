const User = require("../models/User");

const findByEmail = (email) => User.findOne({ email: email.toLowerCase() });

const findById = (id, projection = "-password") =>
  User.findById(id).select(projection).lean();

const create = (data) => User.create(data);

const findMany = (filter = {}, options = {}) => {
  const { select = "_id name email avatar createdAt", sort = { createdAt: -1 } } = options;
  return User.find(filter).select(select).sort(sort).lean();
};

const findByResetPasswordToken = (hashedToken) =>
  User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

const findByEmailAndOtp = (email, otp) =>
  User.findOne({
    email: email.toLowerCase(),
    otp,
    otpExpire: { $gt: Date.now() },
  });

module.exports = {
  findByEmail,
  findById,
  create,
  findMany,
  findByResetPasswordToken,
  findByEmailAndOtp,
};
