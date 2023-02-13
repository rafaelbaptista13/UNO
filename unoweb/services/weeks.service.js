import axios from "axios";

const API_URL = "http://localhost:8080/api";

const getWeeks = () => {
  return axios.get(API_URL + "/contents/weeks").then((response) => {
    return response.data;
  });
};

const WeeksService = {
  getWeeks,
};

export default WeeksService;
