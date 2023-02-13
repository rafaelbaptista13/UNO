import axios from "axios";

const API_URL = "http://localhost:3000/api";

const getWeeks = () => {
  return axios.get(API_URL + "/contents/weeks").then((response) => {
    return response.data;
  });
};

const createWeek = (number_of_videos, number_of_exercises) => {
  return axios
    .post(API_URL + "/contents/weeks", {
      number_of_videos: number_of_videos,
      number_of_exercises: number_of_exercises,
    })
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      } else {
        return { error: true };
      }
    })
    .catch((error) => {
      console.log(error);
      return { error: true };
    });
};

const deleteWeek = (week_id) => {
  return axios
    .delete(API_URL + "/contents/weeks/" + week_id)
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      } else {
        return { error: true };
      }
    })
    .catch((error) => {
      console.log(error);
      return { error: true };
    });
};

const WeeksService = {
  getWeeks,
  createWeek,
  deleteWeek,
};

export default WeeksService;
