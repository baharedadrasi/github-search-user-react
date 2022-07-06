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
  const [request, setRequest] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ show: false, msg: '' });

  const serachGithubUser = async (user) => {
    toggleError();
    setLoading(true);
    const response = await axios(`${rootUrl}/users/${user}`).catch((err) =>
      console.log(err)
    );

    if (response) {
      setGithubuser(response.data);
      const { login, followers_url } = response.data;
      // repose
      // axios(`${rootUrl}/users/${login}/repos?per_page=100`).then((response) => {
      //   setRepos(response.data);
      // });
      // followers
      // axios(`${followers_url}?per_page=100`).then((response) => {
      //   setFollowers(response.data);
      // });

      await Promise.allSettled([
        axios(`${rootUrl}/users/${login}/repos?per_page=100`),
        axios(`${followers_url}?per_page=100`),
      ])
        .then((results) => {
          const [repos, followers] = results;
          const status = 'fulfilled';
          if (repos.status === status) {
            setRepos(repos.value.data);
          } else {
            console.log(results);
            setRepos([]);
          }
          if (followers.status === status) {
            setFollowers(followers.value.data);
          } else {
            console.log(results);
            setFollowers([]);
          }
        })
        .catch((err) => console.log(err));
    } else {
      toggleError(true, 'there is no user with that username');
    }
    checkRequest();
    setLoading(false);
  };

  const checkRequest = () => {
    axios(`${rootUrl}/rate_limit`)
      .then(({ data }) => {
        let {
          rate: { remaining },
        } = data;
        setRequest(remaining);

        if (remaining === 0) {
          toggleError(true, 'sorry, you have exceeded your hourly rate limit!');
        }
      })
      .catch((error) => console.log(error));
  };

  useEffect(checkRequest, []);

  const toggleError = (show = false, msg = '') => {
    setError({ show, msg });
  };

  return (
    <GithubContext.Provider
      value={{
        githubUser,
        repos,
        followers,
        request,
        error,
        loading,
        serachGithubUser,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};
