import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import styled from "styled-components";
import { ActiveClassState } from "../../../redux/features/active_class";
import ActivitiesService from "../../../services/activities.service";
import Loading from "../../utils/loading";
import ErrorCard from "../../utils/error_card";
import Link from "next/link";
import { ButtonPrimary } from "../../../utils/buttons";
import { GameActivityType } from "../../../pages/contents/groups/[id]/students/[student_id]/activities/[activity_id]";

const CardDiv = styled.div`
  position: relative;
`;

interface GameModeTypes {
  [key: string]: string;
}

const game_modes: GameModeTypes = {
  Play: "Reproduzir",
  Identify: "Identificar",
  Build: "Construir"
}

interface NoteTypes {
  [key: string]: string;
}

const note_types: NoteTypes = {
  Circle: "\u25CF",
  RightTriangle: "\u25BA",
  LeftTriangle: "\u25C4",
};

export default function GameActivity({
  student_id,
  activitygroup_id,
  activity_id,
  title,
  description,
  game_info,
  completed,
}: {
  student_id: number;
  activitygroup_id: number;
  activity_id: number;
  title: string;
  description: string | null;
  game_info: GameActivityType;
  completed: boolean;
}) {
  const { id: class_id } = useSelector<RootState, ActiveClassState>(
    (state) => state.active_class
  );
  const [submittedMediaSrc, setSubmittedMediaSrc] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (
      (game_info.mode === "Play" || game_info.mode === "Build") &&
      completed
    ) {
      ActivitiesService.getGameActivitySubmittedMedia(
        class_id,
        activity_id,
        student_id
      )
        .then((blob) => {
          const src = URL.createObjectURL(blob);
          setSubmittedMediaSrc(src);
        })
        .catch((err) => {
          setError(true);
        })
        .finally(() => {
          setIsPageLoading(false);
        });
    }
  }, [activity_id, class_id, completed, game_info.mode, student_id]);

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

            <div className="form-group mb-2">
              <label className="mb-2 primary-text" htmlFor="mode">
                Modo de jogo
              </label>
              <p id="mode">{game_modes[game_info.mode]}</p>
            </div>

            {description !== null && description !== "" && (
              <div className="form-group mb-2">
                <label className="mb-2 primary-text" htmlFor="description">
                  {"Descrição"}
                </label>
                <p id="description">{description}</p>
              </div>
            )}

            {game_info.mode === "Build" && (
              <div className="form-group mb-2">
                <label className="mb-2 primary-text" htmlFor="sequence_length">
                  Comprimento da sequência
                </label>
                <p>{game_info.sequence_length}</p>
              </div>
            )}

            <div className="mb-2 col-xl-11">
              <label className="mb-2 primary-text">
                {(game_info.mode === "Identify" || game_info.mode === "Play") &&
                  "Sequência de notas"}
                {game_info.mode === "Build" && "Notas disponíveis"}
              </label>
              <div className="table-responsive card">
                <table className="table table-bordered text-center">
                  <thead>
                    <tr>
                      <th className="primary-text" rowSpan={2}>
                        #
                      </th>
                      <th className="primary-text" rowSpan={2}>
                        Nome
                      </th>
                      <th className="primary-text" rowSpan={2}>
                        Nota
                      </th>
                      <th className="primary-text" colSpan={2}>
                        Violino
                      </th>
                      <th className="primary-text" colSpan={2}>
                        Viola
                      </th>
                      <th className="primary-text" rowSpan={2}>
                        Tipo
                      </th>
                    </tr>
                    <tr>
                      <th className="primary-text" scope="col">
                        Corda
                      </th>
                      <th className="primary-text" scope="col">
                        Dedo
                      </th>
                      <th className="primary-text" scope="col">
                        Corda
                      </th>
                      <th className="primary-text" scope="col">
                        Dedo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {game_info.notes.map(function (note, index) {
                      return (
                        <tr key={index}>
                          <th className="primary-text" scope="row">
                            {index + 1}
                          </th>
                          <td className="primary-text">{note.name}</td>
                          <td className="primary-text">{note.note_code}</td>
                          <td className="primary-text">{note.violin_string}</td>
                          <td className="primary-text">{note.violin_finger}</td>
                          <td className="primary-text">{note.viola_string}</td>
                          <td className="primary-text">{note.viola_finger}</td>
                          <td className="primary-text">
                            {note_types[note.type]}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {completed && (
              <>
                {game_info.mode === "Build" && (
                  <>
                    <div className="mb-2 col-xl-11">
                      <label className="mb-2 primary-text">
                        Sequência de notas escolhida
                      </label>
                      <div className="table-responsive card">
                        <table className="table table-bordered text-center">
                          <thead>
                            <tr>
                              <th className="primary-text" rowSpan={2}>
                                #
                              </th>
                              <th className="primary-text" rowSpan={2}>
                                Nome
                              </th>
                              <th className="primary-text" rowSpan={2}>
                                Nota
                              </th>
                              <th className="primary-text" colSpan={2}>
                                Violino
                              </th>
                              <th className="primary-text" colSpan={2}>
                                Viola
                              </th>
                              <th className="primary-text" rowSpan={2}>
                                Tipo
                              </th>
                            </tr>
                            <tr>
                              <th className="primary-text" scope="col">
                                Corda
                              </th>
                              <th className="primary-text" scope="col">
                                Dedo
                              </th>
                              <th className="primary-text" scope="col">
                                Corda
                              </th>
                              <th className="primary-text" scope="col">
                                Dedo
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {game_info.chosen_notes!!.map(function (
                              note,
                              index
                            ) {
                              let note_info = game_info.notes.filter(
                                (item) => item.id === note.note_id
                              )[0];
                              return (
                                <tr key={index}>
                                  <th className="primary-text" scope="row">
                                    {index + 1}
                                  </th>
                                  <td className="primary-text">
                                    {note_info.name}
                                  </td>
                                  <td className="primary-text">
                                    {note_info.note_code}
                                  </td>
                                  <td className="primary-text">
                                    {note_info.violin_string}
                                  </td>
                                  <td className="primary-text">
                                    {note_info.violin_finger}
                                  </td>
                                  <td className="primary-text">
                                    {note_info.viola_string}
                                  </td>
                                  <td className="primary-text">
                                    {note_info.viola_finger}
                                  </td>
                                  <td className="primary-text">
                                    {note_types[note_info.type]}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
                {(game_info.mode === "Play" || game_info.mode === "Build") && (
                    <div className="form-group mb-2">
                      <label className="mb-2 primary-text" htmlFor="media">
                        {"Vídeo submetido"}
                      </label>
                      <br />
                      {submittedMediaSrc !== "" && (
                        <video
                          id="media"
                          src={submittedMediaSrc}
                          width={320}
                          height={240}
                          controls
                        />
                      )}
                      {submittedMediaSrc === "" && <Loading />}
                    </div>
                  )}
              </>
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
