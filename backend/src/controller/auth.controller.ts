import { z } from "zod";
import catchError from "../utils/catchError";
import {
  createAccount,
  loginUser,
  refreshUserAccessToken,
  verifyEmail,
} from "../services/auth.service";
import { CREATED, OK, UNAUTHORIZED } from "../constants/statusCode";
import {
  clearAuthCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
} from "../utils/cookies";
import {
  loginSchema,
  registerSchema,
  verificationEmailCodeSchema,
} from "../schema/auth.schema";
import { verifyToken } from "../utils/jwt";
import SessionModel from "../models/session.model";
import appAssert from "../utils/appAssert";

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

export const logoutHandler = catchError(async (req, res) => {
  const accessToken = req.cookies.accessToken as string | undefined;
  const { payload } = verifyToken(accessToken || "");

  if (payload) {
    await SessionModel.findByIdAndDelete(payload.sessionId);
  }
  return clearAuthCookies(res)
    .status(OK)
    .json({ message: "logout successful " });
});

export const refreshHandler = catchError(async (req, res) => {
  const refreshToken = req.cookies["refresh-token"] as string | undefined;
  appAssert(refreshToken, UNAUTHORIZED, "Missign refresh token");

  const { accessToken, newRefershToken } =
    await refreshUserAccessToken(refreshToken);

  if (newRefershToken) {
    res.cookie(
      "refresh-token",
      newRefershToken,
      getRefreshTokenCookieOptions()
    );
  }

  res
    .status(OK)
    .cookie("access-token", accessToken, getAccessTokenCookieOptions());
});

export const verifyEmailHandler = catchError(async (req, res) => {
  const verificationEmailCode = verificationEmailCodeSchema.parse(
    req.params.code
  );

  await verifyEmail(verificationEmailCode);

  res.status(OK).json({
    message: "Email verified",
  });
});
