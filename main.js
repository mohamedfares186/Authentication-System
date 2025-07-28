import "dotenv/config";
const port = process.env.PORT || 8080;
import mongoose from "mongoose";
import app from "./app.js";


mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log("Connected to MongoDB successfully");
  app.listen(port, () => {
    console.log("Server is running");
  });
}).catch(error => console.log("MongoDB connection is interrupted: ", error));