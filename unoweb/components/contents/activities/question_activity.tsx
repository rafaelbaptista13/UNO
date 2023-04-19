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
import { Answer, QuestionActivityType } from "../../../pages/contents/groups/[id]/students/[student_id]/activities/[activity_id]";

const CardDiv = styled.div`
  position: relative;
`;

export type AnswerWithMedia = Answer & {
  media: string | null;
}

export default function QuestionActivity({
  student_id,
  activitygroup_id,
  activity_id,
  title,
  media_type,
  completed,
  question_info,
}: {
  student_id: number;
  activitygroup_id: number;
  activity_id: number;
  title: string;
  media_type: string | null;
  completed: boolean;
  question_info: QuestionActivityType;
}) {
  const { id: class_id } = useSelector<RootState, ActiveClassState>(
    (state) => state.active_class
  );
  const [mediaSrc, setMediaSrc] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState(false);
  const [answers, setAnswers] = useState<Array<AnswerWithMedia>>([]);

  useEffect(() => {
    if (media_type !== null) {
      ActivitiesService.getQuestionActivityMedia(class_id, activity_id)
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
    const fetchAnswerMedia = async () => {
      const promises = question_info.answers.map(async (answer) => {
        if (answer.media_type !== null) {
          const blob = await ActivitiesService.getQuestionActivityAnswerMedia(class_id, activity_id, answer.order);
          const url = URL.createObjectURL(blob);
          return { ...answer, media: url};
        }
        return { ...answer, media: null };
      });
      const urls = await Promise.all(promises);
      setAnswers(urls);
    };
    fetchAnswerMedia();
  }, [activity_id, activitygroup_id, class_id, media_type, question_info.answers, student_id]);

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

            {question_info.question !== null && (
              <div className="form-group mb-2">
                <label className="mb-2 primary-text" htmlFor="question">
                  {"Questão"}
                </label>
                <p id="question">{question_info.question}</p>
              </div>
            )}

            {media_type !== null && (
              <div className="form-group mb-2">
                <label className="mb-2 primary-text" htmlFor="media">
                  {"Ficheiro"}
                </label>
                <br />
                {mediaSrc !== "" && (
                  <>
                    {media_type.split("/")[0] === "video" && (
                      <video
                        id="media"
                        src={mediaSrc}
                        width={320}
                        height={240}
                        controls
                      />
                    )}
                    {media_type.split("/")[0] === "image" && (
                      <Image
                        id="media"
                        src={mediaSrc}
                        width={320}
                        height={240}
                        alt={"Imagem submetida"}
                      />
                    )}
                    {media_type.split("/")[0] === "audio" && (
                      <audio id="media" src={mediaSrc} controls />
                    )}
                  </>
                )}
                {mediaSrc === "" && (
                  <Loading />
                )}
              </div>
            )}

            <div className="form-group mb-2">
              <label className="mb-2 primary-text">Tipo de resposta</label>
              {question_info.one_answer_only && (
                <p>Resposta única</p>
              )}
              {!question_info.one_answer_only && (
                <p>Múltiplas respostas</p>
              )}
            </div>

            <div className="form-group mb-2 col-xl-6">
            <label className="mb-2 primary-text">Respostas</label>
              {answers.map(function (answer, index) {
                let content = null;
                if (answer.media !== null) {
                  content = 
                    <>
                      <div className="col-5 d-flex align-items-center">
                        <span className="primary-text">
                          {answer.answer}
                        </span>
                      </div>
                      <div className="col-5">
                        <span className="primary-text">
                        <Image
                          src={answer.media}
                          width={100}
                          height={100}
                          alt={"Imagem da resposta"}
                        />
                        </span>
                      </div>
                    </>
                } else {
                  content = 
                  <div className="col-10 d-flex align-items-center">
                    <span className="primary-text">
                      {answer.answer}
                    </span>
                  </div>
                }

                return (
                  <div
                    className={ answer.chosen ? "col border-dark card py-1 mb-1" : "col border card py-1 mb-1"}
                    key={answer.order}
                  >
                    <div className="container">
                      <div className="row">
                        <div className="col-1 d-flex align-items-center">
                          <strong className="mh-2 primary-text">
                            {String.fromCharCode(index + 65)}
                          </strong>
                        </div>
                        {content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardDiv>
      </div>
    </>
  );
}
