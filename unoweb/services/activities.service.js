import api from "./api";

const getActivities = (class_id, activitygroup_id) => {
  return api
    .get("/activities/" + class_id + "?activitygroup_id=" + activitygroup_id)
    .then((response) => {
      return response.data;
    });
};

const getActivity = (class_id, activity_id) => {
  return api
    .get("/activities/" + class_id + "/" + activity_id)
    .then((response) => {
      return response.data;
    });
};

const createActivity = (class_id, type, activitygroup_id, title) => {
  return api
    .post("/activities/" + class_id, {
      type: type,
      activitygroup_id: activitygroup_id,
      title: title,
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

const createMediaActivity = (
  class_id,
  activitygroup_id,
  title,
  file,
  description
) => {
  const formData = new FormData();
  formData.append("media", file);
  formData.append("activitygroup_id", activitygroup_id);
  formData.append("title", title);
  formData.append("description", description);

  return api
    .post("/activities/" + class_id + "/media", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
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

const updateMediaActivity = (
  class_id,
  activity_id,
  title,
  file,
  description
) => {
  const formData = new FormData();
  formData.append("media", file);
  formData.append("title", title);
  formData.append("description", description);

  return api
    .put("/activities/" + class_id + "/media/" + activity_id, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
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

const getActivityMedia = (class_id, activitygroup_id, activity_id) => {
  return api
    .get(
      "/activities/" +
        class_id +
        "/" +
        activitygroup_id +
        "/" +
        activity_id +
        "/media"
        , {
          responseType: "blob"
        }
    )
    .then((response) => {
      return response.data;
    });
};

const updateActivity = (class_id, activity_id, type, title) => {
  return api
    .put("/activities/" + class_id + "/" + activity_id, {
      type: type,
      title: title,
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

const changeOrder = (class_id, activitygroup_id, new_order) => {
  return api
    .put("activities/" + class_id + "/change_order", {
      activitygroup_id: activitygroup_id,
      new_order: new_order,
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

const deleteActivity = (class_id, activity_id, activitygroup_id) => {
  return api
    .delete("/activities/" + class_id + "/" + activity_id, {
      data: {
        activitygroup_id: activitygroup_id,
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
  createMediaActivity,
  updateMediaActivity,
  getActivityMedia,
  updateActivity,
  changeOrder,
  deleteActivity,
};

export default ActivitiesService;
