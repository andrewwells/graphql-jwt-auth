import React, {useState, useEffect} from 'react';
import Routes from './Routes';
import {setAccessToken} from './accessToken';
import {ApiUrl} from './constants';

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${ApiUrl}/refresh_token`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        const {accessToken} = await res.json();
        if (accessToken) {
          setAccessToken(accessToken);
          setLoading(false);
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>loading..</div>;
  }
  return <Routes />;
};
