import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ActiveClassState } from "../../../redux/features/active_class";
import { setType } from "../../../redux/features/activitiesSlice";
import { RootState } from "../../../redux/store";
import ActivitiesService from "../../../services/activities.service";
import Image from "next/image";
import styled from "styled-components";

const CardDiv = styled.div`
  position: relative;
`;

export default function ExerciseForm({
  setIsLoading,
  setErrorMessage,
  setSuccessMessage,
  activitygroup_id,
}: {
  setIsLoading: (value: boolean) => void;
  setErrorMessage: (value: string) => void;
  setSuccessMessage: (value: string) => void;
  activitygroup_id: number;
}) {
  const dispatch = useDispatch();
  const { id: class_id } = useSelector<RootState, ActiveClassState>(
    (state) => state.active_class
  );
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [mediaSrc, setMediaSrc] = useState("");
  const [description, setDescription] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile !== null) {
      setFile(selectedFile);
      const src = URL.createObjectURL(selectedFile);
      setMediaSrc(src);
    }
  };

  const createNewExerciseActivity = async () => {
    setIsLoading(true);

    const new_activity_response =
      await ActivitiesService.createExerciseActivity(
        class_id,
        activitygroup_id,
        title,
        file,
        description
      );

    setIsLoading(false);

    if (new_activity_response.error) {
      // An error occured
      setErrorMessage(
        "Aconteceu um erro ao criar a nova atividade. Por favor tente novamente."
      );
    } else {
      // Activity created successfully
      setSuccessMessage("A atividade " + title + " foi criada com sucesso!");
    }
  };

  return (
    <>
      <div className="row g-3 mt-2 mb-4">
        <CardDiv className="container p-3 bg-white shadow-sm rounded">
          <div className="row">
            <div className="form-group mb-2">
              <label className="mb-2 primary-text" htmlFor="title_input">
                Título
              </label>
              <input
                type="text"
                className="form-control"
                id="title_input"
                placeholder="Insira um título"
                onChange={(event) => setTitle(event.target.value)}
                value={title}
              />
            </div>
            <div className="form-group mb-2">
              <label className="mb-2 primary-text" htmlFor="video_input">
                {"Ficheiro (vídeo, imagem ou áudio)"}
              </label>
              <input
                type="file"
                className="form-control"
                id="video_input"
                onChange={handleFileChange}
                accept="audio/*,video/*,image/*"
              />
              {file && <p>Ficheiro submetido: {file.name}</p>}
              {file?.type.split("/")[0] === "video" && (
                <video src={mediaSrc} width={320} height={240} controls />
              )}
              {file?.type.split("/")[0] === "image" && (
                <Image
                  src={mediaSrc}
                  width={320}
                  height={240}
                  alt={"Imagem submetida"}
                />
              )}
              {file?.type.split("/")[0] === "audio" && (
                <audio src={mediaSrc} controls />
              )}
            </div>
            <div className="form-group mb-2">
              <label className="mb-2 primary-text" htmlFor="description_input">
                {"Descrição (Opcional)"}
              </label>
              <textarea
                className="form-control"
                id="description_input"
                rows={3}
                onChange={(event) => setDescription(event.target.value)}
                value={description}
              ></textarea>
            </div>
          </div>
        </CardDiv>
      </div>
      <div className="row g-3 my-2">
        <div className="col gap-3 d-flex justify-content-end">
          <button className="btn btn-success" onClick={createNewExerciseActivity}>
            Concluir
          </button>
          <button
            className="btn btn-danger"
            onClick={() => dispatch(setType(""))}
          >
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
}
