import axios from "axios";

const API_URL = "http://localhost:3000/api/auth/";

const register = (first_name, last_name, email, password) => {
  return axios.post(API_URL + "signup", {
    first_name,
    last_name,
    email,
    password,
  });
};

const login = (email, password) => {
  return axios
    .post(API_URL + "signin", {
      email,
      password,
    })
    .then((response) => {
      if (response.data.email) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      return response.data;
    });
};

const refreshtoken = () => {
  return axios
    .post(API_URL + "refreshtoken", {})
    .then((response) => {
      console.log("AuthService: " + response.headers);
      return response.data;
    })
    .catch((err) => {
      console.log(err);
    });
};

const logout = () => {
  localStorage.removeItem("user");
  return axios.post(API_URL + "signout").then((response) => {
    return response.data;
  });
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

const AuthService = {
  register,
  login,
  refreshtoken,
  logout,
  getCurrentUser,
};

export default AuthService;
