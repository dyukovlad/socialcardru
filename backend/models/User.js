const { Schema, model } = require("mongoose");

const schema = new Schema({
  client_time: { type: Date },
  card: { type: Number, required: true },
  id: { type: Number, required: true, unique: true },
  pdcode: { type: Number },
  mindate: { type: Date },
  summa: { type: Number },
  abonent: { type: String, required: true },
  signature: { type: String, required: true, unique: true }
});

module.exports = model("User", schema);
