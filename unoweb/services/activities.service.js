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

/**
 * Media Activities
 */
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
  description,
  file,
  empty_media
) => {
  const formData = new FormData();
  formData.append("media", file);
  formData.append("title", title);
  formData.append("description", description);
  formData.append("empty_media", empty_media);

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

const getMediaActivityMedia = (class_id, activity_id) => {
  return api
    .get("/activities/" + class_id + "/" + activity_id + "/media", {
      responseType: "blob",
    })
    .then((response) => {
      return response.data;
    });
};

/**
 * Exercise Activities
 */
const createExerciseActivity = (
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
    .post("/activities/" + class_id + "/exercise", formData, {
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
const updateExerciseActivity = (
  class_id,
  activity_id,
  title,
  description,
  file,
  empty_media
) => {
  const formData = new FormData();
  formData.append("media", file);
  formData.append("title", title);
  formData.append("description", description);
  formData.append("empty_media", empty_media);

  return api
    .put("/activities/" + class_id + "/exercise/" + activity_id, formData, {
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
const getExerciseActivityMedia = (class_id, activity_id) => {
  return api
    .get("/activities/" + class_id + "/" + activity_id + "/exercise/media", {
      responseType: "blob",
    })
    .then((response) => {
      return response.data;
    });
};
const getExerciseActivitySubmittedMedia = (
  class_id,
  activity_id,
  student_id
) => {
  return api
    .get(
      "/activities/teacher/" +
        class_id +
        "/" +
        activity_id +
        "/exercise/submitted/media/" +
        student_id,
      {
        responseType: "blob",
      }
    )
    .then((response) => {
      return response.data;
    });
};

/**
 * Question Activities
 */
const createQuestionActivity = (
  class_id,
  activitygroup_id,
  question,
  question_file,
  answers,
  one_answer_only
) => {
  const formData = new FormData();
  if (question_file != null) {
    formData.append("question_media", question_file);
  }
  formData.append("activitygroup_id", activitygroup_id);
  formData.append("question", question);
  for (const element of answers) {
    if (element.media != null) {
      const answer = JSON.stringify({ hasMedia: true, answer: element.answer });
      formData.append("answers", answer);
      formData.append("answers_media", element.media);
    } else {
      const answer = JSON.stringify({
        hasMedia: false,
        answer: element.answer,
      });
      formData.append("answers", answer);
    }
  }
  formData.append("one_answer_only", one_answer_only);

  return api
    .post("/activities/" + class_id + "/question", formData, {
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
const updateQuestionActivity = (
  class_id,
  activity_id,
  question,
  question_file,
  answers,
  one_answer_only,
  empty_media
) => {
  const formData = new FormData();
  if (question_file != null) {
    formData.append("question_media", question_file);
  }
  formData.append("question", question);
  formData.append("one_answer_only", one_answer_only);
  formData.append("empty_media", empty_media);
  for (const element of answers) {
    if (element.media != null) {
      const answer = JSON.stringify({ hasMedia: true, answer: element.answer });
      formData.append("answers", answer);
      formData.append("answers_media", element.media);
    } else {
      const answer = JSON.stringify({
        hasMedia: false,
        answer: element.answer,
      });
      formData.append("answers", answer);
    }
  }
  return api
    .put("/activities/" + class_id + "/question/" + activity_id, formData, {
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
}
const getQuestionActivityMedia = (class_id, activity_id) => {
  return api
    .get("/activities/" + class_id + "/" + activity_id + "/question/media", {
      responseType: "blob",
    })
    .then((response) => {
      return response.data;
    });
};
const getQuestionActivityAnswerMedia = (class_id, activity_id, order) => {
  return api
    .get(
      "/activities/" +
        class_id +
        "/" +
        activity_id +
        "/question/answers/" +
        order +
        "/media",
      {
        responseType: "blob",
      }
    )
    .then((response) => {
      return response.data;
    });
};

/**
 * Game Activities
 */
const createGameActivity = (
  class_id,
  activitygroup_id,
  description,
  mode,
  notes,
  sequence_length
) => {
  let body = {
    activitygroup_id: activitygroup_id,
    mode: mode,
    notes: notes,
    description: description,
  };
  console.log(mode);
  if (mode === "Build") {
    console.log(sequence_length);
    body.sequence_length = sequence_length;
  }
  console.log(body);
  return api
    .post("/activities/" + class_id + "/game", body)
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
const updateGameActivity = (
  class_id,
  activity_id,
  description,
  notes,
  sequence_length,
) => {
  let body = {
    description: description,
    notes: notes,
    sequence_length: sequence_length
  }
  console.log(body);
  return api
    .put("/activities/" + class_id + "/game/" + activity_id, body)
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
}
const getGameActivitySubmittedMedia = (class_id, activity_id, student_id) => {
  return api
    .get(
      "/activities/teacher/" +
        class_id +
        "/" +
        activity_id +
        "/game/submitted/media/" +
        student_id,
      {
        responseType: "blob",
      }
    )
    .then((response) => {
      return response.data;
    });
};

const getActivitiesOfStudent = (class_id, activitygroup_id, student_id) => {
  return api
    .get(
      "/activities/teacher/" +
        class_id +
        "/" +
        activitygroup_id +
        "/" +
        student_id
    )
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

const getActivityOfStudent = (
  class_id,
  activitygroup_id,
  activity_id,
  student_id
) => {
  return api
    .get(
      "/activities/teacher/" +
        class_id +
        "/" +
        activitygroup_id +
        "/" +
        activity_id +
        "/" +
        student_id
    )
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

const sendFeedback = (class_id, activity_id, student_id, type, feedback, trophy) => {
  return api
    .put(
      "/activities/teacher/" +
        class_id +
        "/" +
        activity_id +
        "/" +
        type +
        "/feedback/" +
        student_id,
      {
        feedback: feedback,
        trophy: trophy !== -1 ? trophy : null
      }
    )
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
  getActivitiesOfStudent,
  getActivityOfStudent,
  createActivity,
  createMediaActivity,
  updateMediaActivity,
  getMediaActivityMedia,
  createExerciseActivity,
  updateExerciseActivity,
  getExerciseActivityMedia,
  getExerciseActivitySubmittedMedia,
  createQuestionActivity,
  updateQuestionActivity,
  getQuestionActivityMedia,
  getQuestionActivityAnswerMedia,
  createGameActivity,
  updateGameActivity,
  getGameActivitySubmittedMedia,
  updateActivity,
  changeOrder,
  deleteActivity,
  sendFeedback
};

export default ActivitiesService;
