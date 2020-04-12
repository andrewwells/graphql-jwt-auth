import { sign } from "jsonwebtoken";

export const createAccessToken = (userId: number) => {
  return sign({ userId }, process.env.ACCESS_TOKEN_SECRET! as string, {
    expiresIn: "15m",
  });
};

export const createRefreshToken = (userId: number, tokenVersion: number) => {
  return sign(
    { userId, tokenVersion },
    process.env.REFRESH_TOKEN_SECRET! as string,
    {
      expiresIn: "7d",
    }
  );
};
