import "dotenv/config";
import express from "express";
import connectToDatabase from "./config/db";
import { APP_ORIGIN, NODE_ENV, PORT } from "./constants/env";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorHandler from "./middleware/errorHandler";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: APP_ORIGIN,
    credentials: true,
  })
);
app.get("/", (req, res) => {
  res.status(200).json({
    message: "healthy",
  });
});

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server is listening on port ${PORT} in ${NODE_ENV} enviourment`);
  await connectToDatabase();
});
