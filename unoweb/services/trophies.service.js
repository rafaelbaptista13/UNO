import api from "./api";

const getAvailableTrophies = (class_id, student_id) => {
  return api
    .get("/trophies/" + class_id + "/available/" + student_id)
    .then((response) => {
      return response.data;
    });
};

const TrophiesService = {
  getAvailableTrophies,
};

export default TrophiesService;
