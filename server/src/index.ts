import 'dotenv/config';
import 'reflect-metadata';
import {createConnection, ConnectionOptions} from 'typeorm';
import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import {buildSchema} from 'type-graphql';
import {UserResolver} from './UserResolver';
import cookieParser from 'cookie-parser';
import {verify} from 'jsonwebtoken';
import {User} from './entity/User';
import {createAccessToken, createRefreshToken} from './auth';
import {sendRefreshToken} from './sendRefreshToken';
import cors from 'cors';
import {isProduction} from './constants';

(async () => {
  //await createConnection();

  await createConnection(<ConnectionOptions>{
    type: 'postgres',

    // We need add the extra SSL to use heroku on localhost
    extra: {
      ssl: process.env.DATABASE_SSL === 'true',
    },

    // Change the next line to use the Heroku postgresql from other environment like localhost, remenber that heroku changes this data periodically for security reasons
    url: process.env.DATABASE_URL,

    entities: isProduction ? ['entity/**/*.js'] : ['src/entity/**/*.ts'],
    subscribers: [],
    synchronize: process.env.DATABASE_SYNC === 'true',
  });

  const app = express();
  app.use(
    cors({
      origin: process.env.WEB_URL || 'http://localhost:3000',
      credentials: true,
    }),
  );
  app.use(cookieParser());

  app.get('/health', (_, res) => {
    res.send(200);
  });

  app.post('/refresh_token', async (req, res) => {
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

      return res.json({accessToken: createAccessToken(user!.id)});
    } catch (err) {
      return res.status(401).send();
    }
  });

  const schema = await buildSchema({resolvers: [UserResolver]});

  const apolloServer = new ApolloServer({
    schema,
    context: ({req, res}) => ({req, res}),
    introspection: true,
    playground: true,
  });
  apolloServer.applyMiddleware({app, cors: false});

  const port = process.env.PORT || '4000';
  app.listen(parseInt(port), () => {
    console.log(`server listening on http://localhost:${port}`);
  });
})();
