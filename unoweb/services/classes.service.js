import api from "./api";

const API_URL = "http://deti-viola.ua.pt/api";

const getClasses = () => {
  return api.get(API_URL + "/classes").then((response) => {
    return response.data;
  });
};

const createClass = (name) => {
  return api
    .post(API_URL + "/classes", {
      name: name,
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

const updateClass = (id, name) => {
  return api
    .put(API_URL + "/classes/" + id, {
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

const deleteClass = (class_id) => {
  return api
    .delete(API_URL + "/classes/" + class_id)
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

const ClassesService = {
  getClasses,
  createClass,
  updateClass,
  deleteClass
};

export default ClassesService;
