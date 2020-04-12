import "dotenv/config";
import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./UserResolver";
import cookieParser from "cookie-parser";
import { verify } from "jsonwebtoken";
import { User } from "./entity/User";
import { createAccessToken, createRefreshToken } from "./auth";
import { sendRefreshToken } from "./sendRefreshToken";
import cors from "cors";

(async () => {
  await createConnection();

  const app = express();
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(cookieParser());

  app.get("/health", (_, res) => {
    res.send(200);
  });

  app.post("/refresh_token", async (req, res) => {
    const token = req.cookies.sid;
    if (!token) {
      return res.status(401).send();
    }

    try {
      const payload: any = verify(token, process.env.REFRESH_TOKEN_SECRET!);
      const user = await User.findOne(payload.userId);

      if (user!.tokenVersion !== payload.tokenVersion) {
        return res.status(401).send;
      }

      // Refresh refresh token if user is active
      sendRefreshToken(res, createRefreshToken(user!.id, user!.tokenVersion));

      return res.json({ accessToken: createAccessToken(user!.id) });
    } catch (err) {
      return res.status(401).send();
    }
  });

  const schema = await buildSchema({ resolvers: [UserResolver] });

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res }),
  });
  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log("server listening on http://localhost:4000");
  });
})();
