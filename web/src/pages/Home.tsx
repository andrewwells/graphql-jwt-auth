import React from "react";
import { useUsersQuery } from "../generated/graphql";

interface Props {}

export const Home: React.FC<Props> = () => {
  const { data, error, loading } = useUsersQuery({
    fetchPolicy: "network-only",
  });

  if (error) {
    console.log(error);
    return <div>error</div>;
  }

  if (loading || !data) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <div>users:</div>
      <ul>
        {data.users.map((u) => {
          return (
            <li key={u.id}>
              {u.email} {u.id}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
