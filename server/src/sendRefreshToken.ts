import {Response} from 'express';
export const sendRefreshToken = (res: Response, token: string) => {
  res.cookie('sid', token, {
    httpOnly: true,
    secure: false, // need to setup SSL before this can be turned on.
    path: '/refresh_token',
  });
};
