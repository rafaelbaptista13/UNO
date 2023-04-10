import api from "./api";

const getActivityGroups = (class_id) => {
  return api.get("/activitygroup/" + class_id).then((response) => {
    return response.data;
  });
};

const getActivityGroup = (class_id, activitygroup_id) => {
  return api.get("/activitygroup/" + class_id + "/" + activitygroup_id).then((response) => {
    return response.data;
  });
};

const createActivityGroup = (class_id, name, number_of_videos, number_of_exercises) => {
  return api
    .post("/activitygroup/" + class_id, {
      name: name,
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

const getStudentsFromActivityGroup = (class_id, activitygroup_id) => {
  return api
    .get("/activitygroup/" + class_id + "/" + activitygroup_id + "/students")
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      } else {
        return { error: true };
      }
    });
};

const changeOrder = (class_id, new_order) => {
  return api
    .put("activitygroup/" + class_id + "/change_order", {
      new_order: new_order
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
    })
}

const updateActivityGroup = (class_id, id, name) => {
  return api
    .put("/activitygroup/" + class_id + "/" + id, {
      name: name
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

const deleteActivityGroup = (class_id, activitygroup_id) => {
  return api
    .delete("/activitygroup/" + class_id + "/" + activitygroup_id)
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

const ActivityGroupsService = {
  getActivityGroups,
  getActivityGroup,
  createActivityGroup,
  getStudentsFromActivityGroup,
  changeOrder,
  updateActivityGroup,
  deleteActivityGroup,
};

export default ActivityGroupsService;
