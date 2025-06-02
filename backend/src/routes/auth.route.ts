import { Router } from "express";
import { registerHandler } from "../controller/auth.controller";

const authRoutes = Router();

//prefix: /auth
authRoutes.post("/register", registerHandler);
export default authRoutes;
