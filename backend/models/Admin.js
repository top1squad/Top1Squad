const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
});

adminSchema.plugin(passportLocalMongoose, {
  usernameField: "name",
});

module.exports = mongoose.model("Admin", adminSchema);