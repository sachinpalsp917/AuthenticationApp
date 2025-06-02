import { z } from "zod";
import catchError from "../utils/catchError";
import { createAccount, loginUser } from "../services/auth.service";
import { CREATED, OK } from "../constants/statusCode";
import { setAuthCookies } from "../utils/cookies";
import { loginSchema, registerSchema } from "../schema/auth.schema";

export const registerHandler = catchError(async (req, res) => {
  //validate request
  const request = registerSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  //call service
  const { user, accessToken, refreshToken } = await createAccount(request);

  //return response
  setAuthCookies({ res, accessToken, refreshToken }).status(CREATED).json(user);
});

export const loginHandler = catchError(async (req, res) => {
  const request = loginSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const { accessToken, refreshToken, user } = await loginUser(request);

  setAuthCookies({ res, accessToken, refreshToken }).status(OK).json({
    message: "Login successful",
  });
});
