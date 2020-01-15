const express = require("express");
const bodyParser = require("body-parser");
const config = require("config");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

// app.use(express.json({ extended: true }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use("/api/card", require("./routes/card.routes"));

app.get("/get", function(req, res) {
  console.log("GET request to the homepage 1");
  // res.send("GET request to the homepage 2");
  res.status(201).json({ message: "Hello" });
});

// router.get("/", async (req, res) => {
// 	res.status(201).json({ message: "Hello" });
// });

if (process.env.NODE_ENV === "production") {
  app.use("/", express.static(path.join(__dirname, "client", "build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || config.get("port");

console.log(PORT);

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
