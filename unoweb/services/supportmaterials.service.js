import api from "./api";

const getMaterials = (class_id) => {
  return api.get("/supportmaterials/" + class_id).then((response) => {
    return response.data;
  });
};

const getMaterial = (class_id, material_id) => {
  return api.get("/supportmaterials/" + class_id + "/" + material_id).then((response) => {
    return response.data;
  });
};

const createMaterial = (class_id, title, file, description) => {
  const formData = new FormData();
  formData.append("media", file);
  formData.append("title", title);
  formData.append("description", description);

  return api
    .post("/supportmaterials/" + class_id, formData, {
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

const changeOrder = (class_id, new_order) => {
  return api
    .put("/supportmaterials/" + class_id + "/change_order", {
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

const updateMaterial = (class_id, id, title, description, file, empty_media) => {
  const formData = new FormData();
  formData.append("media", file);
  formData.append("title", title);
  formData.append("description", description);
  formData.append("empty_media", empty_media);

  return api
    .put("/supportmaterials/" + class_id + "/" + id, formData, {
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

const deleteMaterial = (class_id, id) => {
  return api
    .delete("/supportmaterials/" + class_id + "/" + id)
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

const getMedia = (class_id, id) => {
  return api
    .get("/supportmaterials/" + class_id + "/" + id + "/media", {
      responseType: "blob",
    })
    .then((response) => {
      return response.data;
    });
};

const SupportMaterialsService = {
  getMaterials,
  getMaterial,
  createMaterial,
  changeOrder,
  updateMaterial,
  deleteMaterial,
  getMedia
};

export default SupportMaterialsService;
