import UserModel from "../models/user.model";

export type createAccountParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const createAccount = async (data: createAccountParams) => {
  //verify existing user doesn't exist
  const existingUser = await UserModel.exists({ email: data.email });
  if (existingUser) throw new Error("User already exists");
  //create user
  const user = UserModel.create({
    email: data.email,
    password: data.password,
  });
  //create verfication code
  //send verification mail
  //create session
  //sign access token & refresh token
  //return user & tokens
};
