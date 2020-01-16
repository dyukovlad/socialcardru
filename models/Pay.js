const { Schema, model } = require("mongoose");

const schema = new Schema({
  Status: { type: String },
  StatusASOP: { type: String },
  DateCreate: { type: Date, default: Date.now },
  DateUpdate: { type: Date, default: Date.now },
  Order_ID: { type: Number, required: true, unique: true },
  Signature: { type: String, required: true, unique: true }
});

module.exports = model("Pay", schema);
