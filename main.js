require("dotenv").config();
const port = process.env.PORT || 8080;
const mongoose = require("mongoose");
const app = require("./app");


mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log("Connected to MongoDB successfully");
  app.listen(port, () => {
    console.log("Server is running");
  });
}).catch(error => console.log("MongoDB connection is interrupted: ", error));