import React, { useState, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';
import { useContext } from 'react';

const rootUrl = 'https://api.github.com';

export const GithubContext = React.createContext();

export const GithubProvider = ({ children }) => {
  const [githubUser, setGithubuser] = useState(mockUser);
  const [repos, setRepos] = useState(mockRepos);
  const [followers, setFollowers] = useState(mockFollowers);
  const [request, setRequest] = useState({ limit: 0, remaining: 0 });
  const [loading, setLoading] = useState(false);
  // error

  const checkRequest = () => {
    axios(`${rootUrl}/rate_limit`)
      .then(({ data }) => {
        const {
          rate: { limit, remaining },
        } = data;
        setRequest({ limit, remaining });
      })
      .catch((error) => console.log(error));
  };

  useEffect(checkRequest, []);

  return (
    <GithubContext.Provider value={{ githubUser, repos, followers, request }}>
      {children}
    </GithubContext.Provider>
  );
};
