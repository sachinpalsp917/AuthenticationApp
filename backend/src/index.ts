import "dotenv/config";
import express from "express";
import connectToDatabase from "./config/db";
import { NODE_ENV, PORT } from "./constants/env";

const app = express();

app.get("/", (req, res) => {
  res.status(200).json({
    message: "healthy",
  });
});

app.listen(PORT, async () => {
  console.log(`Server is listening on port ${PORT} in ${NODE_ENV} enviourment`);
  await connectToDatabase();
});
