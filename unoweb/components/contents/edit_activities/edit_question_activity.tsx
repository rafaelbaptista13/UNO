import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
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
import { QuestionActivityType } from "../../../pages/contents/groups/edit/[id]/activities/[activity_id]";

const CardDiv = styled.div`
  position: relative;
`;

interface Answer {
  id: number;
  answer: string;
  media: File | null;
}

export default function EditQuestionActivity({
  activity_id,
  title,
  question_info,
  setIsLoading,
  setErrorMessage,
  setSuccessMessage,
  activitygroup_id,
}: {
  activity_id: number;
  title: string;
  question_info: QuestionActivityType;
  setIsLoading: (value: boolean) => void;
  setErrorMessage: (value: string) => void;
  setSuccessMessage: (value: string) => void;
  activitygroup_id: number;
}) {
  const { id: class_id } = useSelector<RootState, ActiveClassState>(
    (state) => state.active_class
  );

  const [input_question, setInputQuestion] = useState(question_info.question);
  const [question_file, setFile] = useState<File | null>(null);
  const [question_media_src, setQuestionMediaSrc] = useState("");

  const [answers, setAnswers] = useState<Answer[]>([]);

  // New Answer
  const [new_answer_text, setNewAnswerText] = useState("");
  const [new_answer_img, setNewAnswerImg] = useState<File | null>(null);
  const [new_answer_media_src, setNewAnswerMediaSrc] = useState("");

  // One Answer Only
  const answer_type_text_ref = useRef<HTMLLabelElement>(null);
  const answer_type_input_ref = useRef<HTMLInputElement>(null);
  const [one_answer_only, setOneAnswerOnly] = useState(question_info.one_answer_only);

  const [empty_media, setEmptyMedia] = useState(false);
  const [submitted_media_type, setSubmittedMediaType] = useState(question_info.media_type);

  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState(false);

  // Handle Question file change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile !== null) {
      setFile(selectedFile);
      const src = URL.createObjectURL(selectedFile);
      setQuestionMediaSrc(src);
      setEmptyMedia(false);
    }
  };

  // Handle New Answer file change
  const handleNewAnswerFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile !== null) {
      setNewAnswerImg(selectedFile);
      const src = URL.createObjectURL(selectedFile);
      setNewAnswerMediaSrc(src);
    }
  }

  const handleChangeAnswerType = () => {
    setOneAnswerOnly(!one_answer_only);
  }

  const addAnswer = () => {
    const new_answer = {
      id: answers.length,
      answer: new_answer_text,
      media: new_answer_img
    };

    let _answers = [...answers, new_answer];
    setAnswers(_answers);
    setNewAnswerText("");
    setNewAnswerMediaSrc("");
    setNewAnswerImg(null);
    let file_input = answer_type_input_ref.current;
    if (file_input) {
      file_input.value = "";
    }
  };

  const deleteAnswer = (id: number) => {
    let _answers = [...answers];
    _answers.splice(id, 1);
    for (let idx = id; idx < _answers.length; idx++) {
      _answers[idx].id -= 1; 
    }
    setAnswers(_answers);
  };

  const editQuestionActivity = async () => {
    setIsLoading(true);

    const edit_activity_response = await ActivitiesService.updateQuestionActivity(
      class_id,
      activity_id,
      input_question,
      question_file,
      answers,
      one_answer_only,
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
      setSuccessMessage("A atividade " + input_question + " foi editada com sucesso!");
    }
  };

  useEffect(() => {
    if (question_info.media_type !== null) {
      ActivitiesService.getQuestionActivityMedia(class_id, activity_id)
        .then((blob) => {
          const src = URL.createObjectURL(blob);
          setQuestionMediaSrc(src);
        })
        .catch((err) => {
          setError(true);
        })
        .finally(() => {
          setIsPageLoading(false);
        });
    }

    const fetchAnswerMedia = async () => {
      const promises = question_info.answers.map(async (answer, index) => {
        if (answer.media_type !== null) {
          const blob = await ActivitiesService.getQuestionActivityAnswerMedia(class_id, activity_id, answer.order);
          const file = new File([blob], "file." + answer.media_type.split("/")[1], {type: blob.type})
          return { id: index, answer: answer.answer, media: file};
        }
        return { id: index, answer: answer.answer, media: null};
      });
      const _answers = await Promise.all(promises);
      setAnswers(_answers);
    };
    fetchAnswerMedia();
  }, [activity_id, class_id, question_info.media_type, question_info.answers]);

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
                Pergunta
              </label>
              <input
                type="text"
                className="form-control"
                id="title_input"
                maxLength={250}
                placeholder="Escreva a sua pergunta"
                onChange={(event) => setInputQuestion(event.target.value)}
                value={input_question}
              />
            </div>

            <div className="form-group mb-2 col-xl-6">
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

              {!question_file && (
                <>
                  {submitted_media_type !== null && (
                    <EditInputMedia
                      mediaSrc={question_media_src}
                      submitted_media_type={submitted_media_type}
                      setSubmittedMediaType={setSubmittedMediaType}
                      setFile={setFile}
                      setMediaSrc={setQuestionMediaSrc}
                      setEmptyMedia={setEmptyMedia}
                    />
                  )}
                </>
              )}

              {question_file && <p>Ficheiro submetido: {question_file.name}</p>}
              {question_file?.type.split("/")[0] === "video" && (
                <video src={question_media_src} width={320} height={240} controls />
              )}
              {question_file?.type.split("/")[0] === "image" && (
                <Image
                  src={question_media_src}
                  width={320}
                  height={240}
                  alt={"Imagem submetida"}
                />
              )}
              {question_file?.type.split("/")[0] === "audio" && (
                <audio src={question_media_src} controls />
              )}
              {question_file && (
                <>
                  <br />
                  <button
                    className="btn btn-secondary mt-2"
                    onClick={() => {
                      setSubmittedMediaType(null);
                      setFile(null);
                      setQuestionMediaSrc("");
                      setEmptyMedia(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon> Remover
                    mídia
                  </button>
                </>
              )}
            </div>

            <div className="form-group mb-2 col-xl-6">
              <label className="mb-2 primary-text">
                {"Tipo de resposta"}
              </label>
              <div className="form-check form-switch d-flex align-items-center">
                <input className="form-check-input" type="checkbox" id="answer_type_switch" onClick={handleChangeAnswerType} checked={!one_answer_only} />
                <label className="form-check-label primary-text ms-3" id="answer_type_text" ref={answer_type_text_ref} htmlFor="answer_type_switch">
                  {one_answer_only ? "Apenas uma resposta" : "Várias respostas"}
                </label>
              </div>
            </div>

            <div className="form-group mb-2 col-xl-6">
              <label className="mb-2 primary-text" htmlFor="add_response_input">
                Adicionar resposta
              </label>
              <div className="d-flex">
                <input
                  type="text"
                  className="form-control"
                  id="add_response_input"
                  placeholder="Escreva a sua resposta"
                  maxLength={250}
                  onChange={(event) => setNewAnswerText(event.target.value)}
                  value={new_answer_text}
                />
                <input
                  type="file"
                  className="form-control ms-2"
                  id="new_answer_video_input"
                  onChange={handleNewAnswerFileChange}
                  accept="image/*"
                  ref={answer_type_input_ref}
                />
                <button className="btn btn-warning ms-2" onClick={addAnswer}>
                  <strong>+</strong>
                </button>
              </div>
              {new_answer_img && <p>Ficheiro submetido: {new_answer_img.name}</p>}
              {new_answer_img?.type.split("/")[0] === "image" && (
                <Image
                  src={new_answer_media_src}
                  width={320}
                  height={240}
                  alt={"Imagem submetida"}
                />
              )}
            </div>

            <div className="form-group mb-2 col-xl-6">
              <label className="mb-2 primary-text">Respostas</label>
              {answers.map(function (answer, index) {
                let answer_media = null;
                let content = null;
                if (answer.media) {
                  answer_media = URL.createObjectURL(answer.media);
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
                          src={answer_media}
                          width={100}
                          height={100}
                          alt={"Imagem submetida"}
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
                    className="col border card py-1 mb-1"
                    key={answer.id}
                  >
                    <div className="container">
                      <div className="row">
                        <div className="col-1 d-flex align-items-center">
                          <strong className="mh-2 primary-text">
                            {String.fromCharCode(answer.id + 65)}
                          </strong>
                        </div>
                        {content}
                        <div className="col-1 d-flex align-items-center justify-content-center">
                          <FontAwesomeIcon onClick={() => deleteAnswer(answer.id)} icon={faTrash} style={{ cursor: 'pointer' }}/>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </CardDiv>
      </div>
      <div className="row g-3 my-2">
        <div className="col gap-3 d-flex justify-content-end">
          <button className="btn btn-success" onClick={editQuestionActivity}>
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
