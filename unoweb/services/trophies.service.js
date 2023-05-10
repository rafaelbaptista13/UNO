import api from "./api";

const getAvailableTrophies = (class_id) => {
  return api
    .get("/trophies/" + class_id + "/available/")
    .then((response) => {
      return response.data;
    });
};

const TrophiesService = {
  getAvailableTrophies,
};

export default TrophiesService;
