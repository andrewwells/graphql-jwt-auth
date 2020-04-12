# GraphQL authentication server using JWTs 

## Includes apollo-express backend and react web app


Trying an approach that returns a short lived (15m) access token and a long lived refresh token in a special cookie.

Access token only lives in memory on the client and frequent requests are made to the `refresh_token` REST endpoint on the server to get a new access token.
