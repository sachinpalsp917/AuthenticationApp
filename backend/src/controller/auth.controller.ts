import { z } from "zod";
import catchError from "../utils/catchError";
import { createAccount } from "../services/auth.service";
import { CREATED } from "../constants/statusCode";
import { setAuthCookies } from "../utils/cookies";

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().max(16).min(8),
    confirmPassword: z.string().max(16).min(8),
    userAgent: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

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
