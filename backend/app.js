const express = require("express");
const config = require("config");
const mongoose = require("mongoose");

const app = express();

app.use(express.json({ extended: true }));

app.use("/api/card", require("./routes/card.routes"));

const PORT = config.get("port") || 5000;

async function start() {
  try {
    await mongoose
      .connect(config.get("mongoURI"), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
      })
      .then(console.log("DB Connection Successfull"))
      .catch(err => {
        console.error(err);
      });
    //run
    app.listen(PORT, () => console.log(`App started on port ${PORT}`));
  } catch (error) {
    console.log("Server error", error.message);
    process.exit(1);
  }
}

start();
