import { Router } from "express";
import {
  loginHandler,
  logoutHandler,
  registerHandler,
} from "../controller/auth.controller";

const authRoutes = Router();

//prefix: /auth
authRoutes.post("/register", registerHandler);
authRoutes.post("/login", loginHandler);
authRoutes.post("/logout", logoutHandler);

export default authRoutes;
