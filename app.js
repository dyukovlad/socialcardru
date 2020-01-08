const express = require("express");
const config = require("config");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
console.error("Start backend build");
app.use(express.json({ extended: true }));

app.use("/api/card", require("./routes/card.routes"));

if (process.env.NODE_ENV === "production") {
  app.use("/", express.static(path.join(__dirname, "client", "build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

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
