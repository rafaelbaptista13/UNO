import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import styled from "styled-components";
import { ActiveClassState } from "../../../redux/features/active_class";
import ActivitiesService from "../../../services/activities.service";
import { ActivityType } from "../../../pages/contents/groups/edit/[id]/activities/[activity_id]";
import Link from "next/link";
import Image from "next/image";
import Loading from "../../utils/loading";
import ErrorCard from "../../utils/error_card";

const CardDiv = styled.div`
  position: relative;
`;

export default function EditMediaForm({
  setIsLoading,
  setErrorMessage,
  setSuccessMessage,
  activitygroup_id,
  activity,
}: {
  setIsLoading: (value: boolean) => void;
  setErrorMessage: (value: string) => void;
  setSuccessMessage: (value: string) => void;
  activitygroup_id: number;
  activity: ActivityType;
}) {
  const { id: class_id } = useSelector<RootState, ActiveClassState>(
    (state) => state.active_class
  );
  const [title, setTitle] = useState(activity.title);
  const [file, setFile] = useState<File | null>(null);
  const [mediaSrc, setMediaSrc] = useState("");
  const [description, setDescription] = useState(activity.description);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile !== null) {
      setFile(selectedFile);
      const src = URL.createObjectURL(selectedFile);
      setMediaSrc(src);
    }
  };

  const updateNewMediaActivity = async () => {
    setIsLoading(true);

    const new_activity_response = await ActivitiesService.updateMediaActivity(
      class_id,
      activity.id,
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

  useEffect(() => {
    setIsPageLoading(true);
    ActivitiesService.getActivityMedia(class_id, activitygroup_id, activity.id)
      .then((blob) => {
        const _file = new File([blob], "", { type: activity.media.media_type });
        setFile(_file);
        const src = URL.createObjectURL(blob);
        setMediaSrc(src);
      })
      .catch((err) => {
        setError(true);
      })
      .finally(() => {
        setIsPageLoading(false);
      });
  }, [activity.id, activity.media.media_type, activitygroup_id, class_id]);

  if (isPageLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="row g-3 mt-2 mb-4">
        <CardDiv className="container p-3 bg-white shadow-sm rounded">
          <div className="row g-3 my-2">
            <ErrorCard message="Ocorreu um erro ao obter as atividades. Por favor tente novamente." />
          </div>
        </CardDiv>
      </div>
    );
  }

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
                {"Ficheiro (vídeo, imagem ou audio)"}
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
          <button className="btn btn-success" onClick={updateNewMediaActivity}>
            Concluir
          </button>
          <Link href={`/contents/groups/edit/${activity.activitygroup_id}`}>
            <button className="btn btn-danger">Cancelar</button>
          </Link>
        </div>
      </div>
    </>
  );
}
