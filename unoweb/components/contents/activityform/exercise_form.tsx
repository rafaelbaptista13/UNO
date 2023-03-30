import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ActivitiesState } from "../../../redux/features/activitiesSlice";
import { RootState } from "../../../redux/store";

export default function ExerciseForm() {
  //const dispatch = useDispatch();
  //const activities_state = useSelector<RootState, ActivitiesState>((state) => state.activities);

  /* TODO Handle the title change
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setTitle(event.target.value));
  };
  */
  
  return (
    <>
      <div className="form-group mb-2">
        <label className="mb-2 primary-text" htmlFor="title_input">
          Título
        </label>
        <input
          type="text"
          className="form-control"
          id="title_input"
          placeholder="Insira um título"
          //onChange={handleChange}
          //value={activities_state.title}
        />
      </div>
      <div className="form-group mb-2">
        <label className="mb-2 primary-text" htmlFor="video_input">
          Vídeo
        </label>
        <input type="file" className="form-control" id="video_input" />
      </div>
      <div className="form-group mb-2">
        <label className="mb-2 primary-text" htmlFor="description_input">
          {"Descrição (Opcional)"}
        </label>
        <textarea
          className="form-control"
          id="description_input"
          rows={3}
        ></textarea>
      </div>
    </>
  );
}
