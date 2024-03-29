import axios from "axios";

const API_URL = process.env.NODE_ENV === "production" ? "https://deti-viola.ua.pt/rb-md-violuno-app-v1/api/auth/" : "http://localhost:3000/api/auth/";

const register = (first_name, last_name, email, password) => {
  return axios.post(API_URL + "teacher/signup", {
    first_name,
    last_name,
    email,
    password
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

const logout = () => {
  localStorage.removeItem("active_class");
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
  logout,
  getCurrentUser,
};

export default AuthService;
