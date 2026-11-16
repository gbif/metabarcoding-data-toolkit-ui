import base64 from "base-64";
import config from "../config";
import axios from "axios";
export const JWT_STORAGE_NAME = "gbif_edna_auth_token";

export const axiosWithAuth = axios.create();

axiosWithAuth.interceptors.response.use(
  (res) => { 
    // extend login
    if(res?.headers?.token){
      axiosWithAuth.defaults.headers.common["Authorization"] = `Bearer ${res?.headers?.token}`;
      storeToken(res?.headers?.token)
    }
    return res;
  });
  
const storeToken = (jwt) => {
  sessionStorage.setItem(JWT_STORAGE_NAME, jwt);
  localStorage.setItem(JWT_STORAGE_NAME, jwt);    
}
export const authenticate = async (username, password) => {
  // POST, not GET: the response body carries the JWT, and as a GET the request was a
  // cacheable URL distinguished from every other user's only by the Authorization header
  return axios(`${config.backend}/auth/login`, {
    method: "post",
    headers: {
      Authorization: `Basic ${base64.encode(username + ":" + password)}`,
    },
  })
    .then((res) => {
      if(res?.data?.token){
        axiosWithAuth.defaults.headers.common["Authorization"] = `Bearer ${res?.data?.token}`;
      }
      return res?.data;
    })
   
};

export const refreshLogin = async () => {
  try {
    const response = await axiosWithAuth.post(`${config.backend}/auth/whoami`)
    return response?.data;
  } catch (err) {
    logout()
    throw err
  }
}

export const logout = () => {
  // End the session on the server too; the token is dropped here whether or not that succeeds
  if (axiosWithAuth.defaults.headers.common["Authorization"]) {
    axiosWithAuth.post(`${config.backend}/auth/logout`).catch(() => {});
  }
  localStorage.removeItem(JWT_STORAGE_NAME);
  sessionStorage.removeItem(JWT_STORAGE_NAME);
  // Unset Authorization header after logout
  axiosWithAuth.defaults.headers.common["Authorization"] = "";
};

// A few actions use the user's GBIF account at GBIF (the data validator, an organization's
// token). When the GBIF login from logging in to the MDT has expired, the backend answers
// 401 gbif-login-required, and the user gives their GBIF password again.
export const isGbifLoginRequired = (error) =>
  error?.response?.status === 401 && error?.response?.data?.error === "gbif-login-required";

export const gbifLogin = (username, password) =>
  axios.post(`${config.backend}/auth/gbif-login`, null, {
    headers: {
      Authorization: `Basic ${base64.encode(username + ":" + password)}`,
      "X-MDT-Token": axiosWithAuth.defaults.headers.common["Authorization"],
    },
  });

export const listApiTokens = () => axiosWithAuth.get(`${config.backend}/user/tokens`).then((res) => res?.data);

export const createApiToken = (label, days) =>
  axiosWithAuth.post(`${config.backend}/user/tokens`, { label, days }).then((res) => res?.data);

export const revokeApiToken = (id) => axiosWithAuth.delete(`${config.backend}/user/tokens/${id}`);

export const getTokenUser = () => {
  const jwt = sessionStorage.getItem(JWT_STORAGE_NAME);
  if (jwt && jwt !== "undefined") {
    // the payload is base64url, without padding
    const payload = jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const user = JSON.parse(base64.decode(payload + "=".repeat((4 - (payload.length % 4)) % 4)));
    // is the token still valid - if not then delete it. This of course is only to ensure the client knows that the token has expired. any authenticated requests would fail anyhow
    if (new Date(user.exp * 1000).toISOString() < new Date().toISOString()) {
      logout();
    }
    return user;
  }

  return null;
};

// use sessionstorage for the session, but save in local storage if user choose to be remembered
const jwt = localStorage.getItem(JWT_STORAGE_NAME);
if (jwt) {
  sessionStorage.setItem(JWT_STORAGE_NAME, jwt);
  //const jwt = sessionStorage.getItem(JWT_STORAGE_NAME);

  axiosWithAuth.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;

  getTokenUser(); // will log the user out if the token has expired
}


