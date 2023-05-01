import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setType } from "../../../redux/features/activitiesSlice";
import { RootState } from "../../../redux/store";
import styled from "styled-components";
import { ActiveClassState } from "../../../redux/features/active_class";
import ActivitiesService from "../../../services/activities.service";
import Image from "next/image";
import Loading from "../../utils/loading";
import ErrorCard from "../../utils/error_card";
import Link from "next/link";
import EditInputMedia from "../../utils/edit_input_media";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const CardDiv = styled.div`
  position: relative;
`;

export default function EditMediaActivity({
  activity_id,
  title,
  description,
  media_type,
  setIsLoading,
  setErrorMessage,
  setSuccessMessage,
  activitygroup_id,
}: {
  activity_id: number;
  title: string;
  description: string | null;
  media_type: string | null;
  setIsLoading: (value: boolean) => void;
  setErrorMessage: (value: string) => void;
  setSuccessMessage: (value: string) => void;
  activitygroup_id: number;
}) {
  const { id: class_id } = useSelector<RootState, ActiveClassState>(
    (state) => state.active_class
  );
  const [input_title, setInputTitle] = useState(title);
  const [file, setFile] = useState<File | null>(null);
  const [mediaSrc, setMediaSrc] = useState("");
  const [input_description, setInputDescription] = useState(
    description != null ? description : ""
  );
  const [empty_media, setEmptyMedia] = useState(false);
  const [submitted_media_type, setSubmittedMediaType] = useState(media_type);

  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile !== null) {
      setFile(selectedFile);
      const src = URL.createObjectURL(selectedFile);
      setMediaSrc(src);
      setEmptyMedia(false);
    }
  };

  const editMediaActivity = async () => {
    setIsLoading(true);

    const edit_activity_response = await ActivitiesService.updateMediaActivity(
      class_id,
      activity_id,
      input_title,
      input_description,
      file,
      empty_media
    );

    setIsLoading(false);

    if (edit_activity_response.error) {
      // An error occured
      setErrorMessage(
        "Aconteceu um erro ao editar a atividade. Por favor tente novamente."
      );
    } else {
      // Activity updated successfully
      setSuccessMessage("A atividade " + input_title + " foi editada com sucesso!");
    }
  };

  useEffect(() => {
    if (media_type !== null) {
      ActivitiesService.getMediaActivityMedia(class_id, activity_id)
        .then((blob) => {
          const src = URL.createObjectURL(blob);
          setMediaSrc(src);
        })
        .catch((err) => {
          setError(true);
        })
        .finally(() => {
          setIsPageLoading(false);
        });
    }
  }, [activity_id, class_id, media_type]);

  if (isPageLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="row g-3 mt-2 mb-4">
        <CardDiv className="container p-3 bg-white shadow-sm rounded">
          <div className="row g-3 my-2">
            <ErrorCard message="Ocorreu um erro ao obter a atividade. Por favor tente novamente." />
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
                maxLength={250}
                placeholder="Insira um título"
                onChange={(event) => setInputTitle(event.target.value)}
                value={input_title}
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

              {!file && (
                <>
                  {submitted_media_type !== null && (
                    <EditInputMedia
                      mediaSrc={mediaSrc}
                      submitted_media_type={submitted_media_type}
                      setSubmittedMediaType={setSubmittedMediaType}
                      setFile={setFile}
                      setMediaSrc={setMediaSrc}
                      setEmptyMedia={setEmptyMedia}
                    />
                  )}
                </>
              )}

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
              {file && (
                <>
                  <br />
                  <button
                    className="btn btn-secondary mt-2"
                    onClick={() => {
                      setSubmittedMediaType(null);
                      setFile(null);
                      setMediaSrc("");
                      setEmptyMedia(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon> Remover
                    mídia
                  </button>
                </>
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
                maxLength={250}
                onChange={(event) => setInputDescription(event.target.value)}
                value={input_description}
              ></textarea>
            </div>
          </div>
        </CardDiv>
      </div>
      <div className="row g-3 my-2">
        <div className="col gap-3 d-flex justify-content-end">
          <button className="btn btn-success" onClick={editMediaActivity}>
            Concluir
          </button>

          <Link href={`/contents/groups/edit/${activitygroup_id}`}>
            <button className="btn btn-danger">Cancelar</button>
          </Link>
        </div>
      </div>
    </>
  );
}
