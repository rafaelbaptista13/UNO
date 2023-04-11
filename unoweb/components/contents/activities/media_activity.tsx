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
import { ButtonPrimary } from "../../../utils/buttons";

const CardDiv = styled.div`
  position: relative;
`;

export default function MediaActivity({
  student_id,
  activitygroup_id,
  activity_id,
  title,
  description,
  media_type,
  completed,
}: {
  student_id: number;
  activitygroup_id: number;
  activity_id: number;
  title: string;
  description: string | null;
  media_type: string | null;
  completed: boolean;
}) {
  const { id: class_id } = useSelector<RootState, ActiveClassState>(
    (state) => state.active_class
  );
  const [mediaSrc, setMediaSrc] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (media_type !== null) {
      ActivitiesService.getActivityMedia(class_id, activity_id)
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
            <ErrorCard message="Ocorreu um erro ao obter as atividade. Por favor tente novamente." />
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
              <label className="mb-2 primary-text" htmlFor="title">
                Título
              </label>
              <p id="title">{title}</p>
            </div>

            {media_type !== null && (
              <div className="form-group mb-2">
                <label className="mb-2 primary-text" htmlFor="media">
                  {"Ficheiro"}
                </label>
                <br />

                {mediaSrc !== "" && (
                  <>
                    {media_type?.split("/")[0] === "video" && (
                      <video
                        id="media"
                        src={mediaSrc}
                        width={320}
                        height={240}
                        controls
                      />
                    )}
                    {media_type?.split("/")[0] === "image" && (
                      <Image
                        id="media"
                        src={mediaSrc}
                        width={320}
                        height={240}
                        alt={"Imagem submetida"}
                      />
                    )}
                    {media_type?.split("/")[0] === "audio" && (
                      <audio id="media" src={mediaSrc} controls />
                    )}
                  </>
                )}
                {mediaSrc === "" && (
                  <Loading />
                )}
              </div>
            )}

            {description !== null && (
              <div className="form-group mb-2">
                <label className="mb-2 primary-text" htmlFor="description">
                  {"Descrição"}
                </label>
                <p id="description">{description}</p>
              </div>
            )}
          </div>
        </CardDiv>
      </div>
      <div className="row g-3 my-2">
        <div className="col gap-3 d-flex justify-content-end">
          <Link
            href={`/contents/groups/${activitygroup_id}/students/${student_id}`}
          >
            <ButtonPrimary>Voltar</ButtonPrimary>
          </Link>
        </div>
      </div>
    </>
  );
}
