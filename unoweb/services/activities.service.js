import axios from "axios";

const API_URL = "http://localhost:3000/api";

const getWeeks = () => {
  return axios.get(API_URL + "/contents/weeks").then((response) => {
    return response.data;
  });
};

const createActivity = (type, weekcontent_id, title) => {
  return axios
    .post(API_URL + "/activities", {
      type: type,
      weekcontent_id: weekcontent_id,
      title: title
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

const updateActivity = (activity_id, type, title) => {
  return axios
    .put(API_URL + "/activities/" + activity_id, {
      type: type,
      title: title
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

const deleteActivity = (activity_id, weekcontent_id) => {
  return axios
    .delete(API_URL + "/activities/" + activity_id, {
      data: {
        weekcontent_id: weekcontent_id,
      },
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

const ActivitiesService = {
  createActivity,
  updateActivity,
  deleteActivity,
};

export default ActivitiesService;
