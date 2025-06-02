import { Router } from "express";
import { loginHandler, registerHandler } from "../controller/auth.controller";

const authRoutes = Router();

//prefix: /auth
authRoutes.post("/register", registerHandler);
authRoutes.post("/login", loginHandler);

export default authRoutes;
