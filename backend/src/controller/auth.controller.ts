import { z } from "zod";
import catchError from "../utils/catchError";

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
  //return response
});
