import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { ActiveClassState } from "../../../redux/features/active_class";
import { setType } from "../../../redux/features/activitiesSlice";
import { RootState } from "../../../redux/store";
import ActivitiesService from "../../../services/activities.service";
import Image from "next/image";

const CardDiv = styled.div`
  position: relative;
`;

interface Answer {
  id: number;
  answer: string;
  media: File | null;
}

export default function QuestionForm({
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
  const [question, setQuestion] = useState("");
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
  const [one_answer_only, setOneAnswerOnly] = useState(true);

  // Handle Question file change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile !== null) {
      setFile(selectedFile);
      const src = URL.createObjectURL(selectedFile);
      setQuestionMediaSrc(src);
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
    const answer_type_text = answer_type_text_ref.current;
    if (answer_type_text) {
      if (one_answer_only) {
        answer_type_text.textContent = "Várias respostas"
      } else {
        answer_type_text.textContent = "Apenas uma resposta"
      }
    }
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

  const createNewQuestionActivity = async () => {
    setIsLoading(true);

    const new_activity_response =
      await ActivitiesService.createQuestionActivity(
        class_id,
        activitygroup_id,
        question,
        question_file,
        answers,
        one_answer_only
      );

    setIsLoading(false);

    if (new_activity_response.error) {
      // An error occured
      setErrorMessage(
        "Aconteceu um erro ao criar a nova atividade. Por favor tente novamente."
      );
    } else {
      // Activity created successfully
      setSuccessMessage("A atividade do tipo Pergunta foi criada com sucesso!");
    }
  };

  return (
    <>
      <div className="row g-3 mt-2 mb-4">
        <CardDiv className="container p-3 bg-white shadow-sm rounded">
          <div className="row">
            <div className="form-group mb-2">
              <label className="mb-2 primary-text" htmlFor="question_input">
                Pergunta
              </label>
              <input
                type="text"
                className="form-control"
                id="question_input"
                placeholder="Escreva a sua pergunta"
                onChange={(event) => setQuestion(event.target.value)}
                value={question}
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
            </div>

            <div className="form-group mb-2 col-xl-6">
              <label className="mb-2 primary-text">
                {"Tipo de resposta"}
              </label>
              <div className="form-check form-switch d-flex align-items-center">
                <input className="form-check-input" type="checkbox" id="answer_type_switch" onClick={handleChangeAnswerType} />
                <label className="form-check-label primary-text ms-3" id="answer_type_text" ref={answer_type_text_ref} htmlFor="answer_type_switch">Apenas uma resposta</label>
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
          <button
            className="btn btn-success"
            onClick={createNewQuestionActivity}
          >
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
