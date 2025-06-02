export type createAccountParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const createAccount = async (data: createAccountParams) => {
  //verify existing user doesn't exist
  //create user
  //create verfication code
  //send verification mail
  //create session
  //sign access token & refresh token
  //return user & tokens
};
