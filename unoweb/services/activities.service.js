import api from "./api";

const getActivities = (class_id, weekcontent_id) => {
  return api.get("/activities/" + class_id +"?weekcontent_id=" + weekcontent_id).then((response) => {
    return response.data;
  });
};

const getActivity = (class_id, activity_id) => {
  return api.get("/activities/" + class_id + "/" + activity_id).then((response) => {
    return response.data;
  });
};

const createActivity = (class_id, type, weekcontent_id, title) => {
  return api
    .post("/activities/" + class_id, {
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

const updateActivity = (class_id, activity_id, type, title) => {
  return api
    .put("/activities/" + class_id + "/" + activity_id, {
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

const deleteActivity = (class_id, activity_id, weekcontent_id) => {
  return api
    .delete("/activities/" + class_id + "/" + activity_id, {
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
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
};

export default ActivitiesService;
