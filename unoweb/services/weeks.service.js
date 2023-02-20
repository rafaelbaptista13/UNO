import api from "./api";

const API_URL = "http://localhost:3000/api";

const getWeeks = (class_id) => {
  return api.get("/contents/weeks/" + class_id).then((response) => {
    return response.data;
  });
};

const getWeek = (class_id, week_id) => {
  return api.get("/contents/weeks/" + class_id + "/" + week_id).then((response) => {
    return response.data;
  });
};

const createWeek = (class_id, number_of_videos, number_of_exercises) => {
  return api
    .post("/contents/weeks/" + class_id, {
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

const deleteWeek = (class_id, week_id) => {
  return api
    .delete("/contents/weeks/" + class_id + "/" + week_id)
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
  getWeek,
  createWeek,
  deleteWeek,
};

export default WeeksService;
