import { ErrorRequestHandler } from "express";
import { INTERNAL_SERVER_ERROR } from "../constants/statusCode";

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.log(`PATH: ${req.path} `, error);
  res.status(INTERNAL_SERVER_ERROR).send("Internal server Error");
};

export default errorHandler;
