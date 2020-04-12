import { MiddlewareFn } from "type-graphql";
import { AppContext } from "./AppContext";
import { verify } from "jsonwebtoken";

export const isAuthenticated: MiddlewareFn<AppContext> = (
  { context },
  next
) => {
  const authorization = context.req.headers.authorization;
  try {
    // assuming Authorization: Bearer <Token>
    const token = authorization!.split(" ")[1];
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);
    context.userId = (payload as any)["userId"];
  } catch (err) {
    // console.log(err);
    throw Error("not authenticated");
  }

  return next();
};
