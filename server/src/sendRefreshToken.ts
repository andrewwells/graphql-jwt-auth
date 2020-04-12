import { Response } from "express";
export const sendRefreshToken = (res: Response, token: string) => {
  res.cookie("sid", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/refresh_token",
  });
};
