import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useLoginMutation, useMeLazyQuery } from "../generated/graphql";
import { setAccessToken } from "../accessToken";

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login] = useLoginMutation();
  const [getMe, { data }] = useMeLazyQuery();

  if (data && data.me) {
    history.push("/");
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const response = await login({
          variables: {
            input: {
              email,
              password,
            },
          },
        });

        if (response && response.data) {
          setAccessToken(response.data.login.accessToken);
        }

        getMe();
      }}
    >
      <div>
        <input
          value={email}
          placeholder="email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
      </div>
      <div>
        <input
          type="password"
          value={password}
          placeholder="password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
      </div>
      <button type="submit">login</button>
    </form>
  );
};
