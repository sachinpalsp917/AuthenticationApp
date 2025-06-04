import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
} from "../constants/statusCode";
import VerificationCodeTypes from "../constants/verficationCodeTypes";
import SessionModel from "../models/session.model";
import UserModel from "../models/user.model";
import VerificationCodeModel from "../models/verficationCode.model";
import appAssert from "../utils/appAssert";
import { ONE_DAY_MS, oneYearFromNow, thirtyDaysFromNow } from "../utils/date";
import jwt from "jsonwebtoken";
import { refreshTokenSignOptions, signToken, verifyToken } from "../utils/jwt";

type createAccountParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const createAccount = async (data: createAccountParams) => {
  //verify existing user doesn't exist
  const existingUser = await UserModel.exists({ email: data.email });
  appAssert(!existingUser, CONFLICT, "Email already in use");
  // if (existingUser) throw new Error("User already exists");

  //create user
  const user = await UserModel.create({
    email: data.email,
    password: data.password,
  });

  //create verfication code
  const verificationCodes = await VerificationCodeModel.create({
    userId: user._id,
    type: VerificationCodeTypes.EmailVerification,
    expiresAt: oneYearFromNow(),
  });

  //send verification mail

  //create session
  const session = await SessionModel.create({
    userId: user._id,
    userAgent: data.userAgent,
  });

  //sign access token & refresh token
  const refreshToken = signToken(
    { sessionId: session._id },
    refreshTokenSignOptions
  );
  const accessToken = signToken({ userId: user._id, sessionId: session._id });

  //return user & tokens
  return { user: user.omitPassword(), refreshToken, accessToken };
};

type loginParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const loginUser = async ({
  email,
  password,
  userAgent,
}: loginParams) => {
  //get the user by email
  const user = await UserModel.findOne({ email });
  appAssert(user, UNAUTHORIZED, "Invalid email or password");

  //validate password from user
  const isValidPassword = await user.comparePassword(password);
  appAssert(isValidPassword, UNAUTHORIZED, "Invalid email or password");
  const userId = user._id;

  //create session
  const session = await SessionModel.create({
    userId,
    userAgent,
  });

  const sessionInfo = { sessionId: session._id };

  //sign access & refresh token
  const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);
  const accessToken = signToken({ ...sessionInfo, userId: user._id });

  //return user & tokens
  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

export const refreshUserAccessToken = async (refreshToken: string) => {
  const { payload } = verifyToken(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });
  appAssert(payload, UNAUTHORIZED, "Invalid refresh token ");

  const session = await SessionModel.findById(payload.sessionId);
  const now = Date.now();
  appAssert(
    session && session.expiresAt.getTime() > now,
    UNAUTHORIZED,
    "Session expired"
  );

  //refresh the session if it expires in next 24 hours
  const sessionNeedRefresh = session.expiresAt.getTime() - now <= ONE_DAY_MS;
  if (sessionNeedRefresh) {
    session.expiresAt = thirtyDaysFromNow();
    await session.save();
  }

  const newRefershToken = sessionNeedRefresh
    ? signToken({ sessionId: session._id }, refreshTokenSignOptions)
    : undefined;

  const accessToken = signToken({
    userId: session.userId,
    sessionId: session._id,
  });

  return { accessToken, newRefershToken };
};

export const verifyEmail = async (code: string) => {
  //get the verification code
  const validCode = await VerificationCodeModel.findOne({
    _id: code,
    type: VerificationCodeTypes.EmailVerification,
    expiresAt: { $gt: new Date() },
  });
  appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");

  //update user to verified true
  const updatedUser = await UserModel.findByIdAndUpdate(
    validCode.userId,
    { verified: true },
    { new: true }
  );
  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");

  //delete verifcation code
  await validCode.deleteOne();

  return { user: updatedUser.omitPassword() };
};
