import React from "react";
import styled from "styled-components";
import AudioForm from "./audio_form";
import ExerciseForm from "./exercise_form";
import GameForm from "./game_form";
import QuestionForm from "./question_form";
import VideoForm from "./video_form";
import { useSelector, useDispatch } from "react-redux";
import { activitiesState, setType } from "../../../redux/features/activitiesSlice";

const CardDiv = styled.div`
  position: relative;
`;

export default function NewActivityForm() {
  const dispatch = useDispatch();
  const activities_state = useSelector(activitiesState);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setType(event.target.value));
  }

  return (
    <CardDiv className="container p-3 bg-white shadow-sm rounded">
      <div className="row">
        <div className="col-sm-6 col-lg-4 ">
          <div className="form-group">
            <label className="mb-2 primary-text" htmlFor="activity_type_input">
              Tipo de atividade
            </label>
            <select
              className="form-select mb-2"
              id="activity_type_input"
              value={activities_state.type}
              onChange={handleChange}
            >
              <option value={"video"}>Vídeo</option>
              <option value={"exercise"}>Exercício</option>
              <option value={"game"}>Jogo A Cor do Som</option>
              <option value={"audio"}>Áudio</option>
              <option value={"question"}>Pergunta</option>
            </select>
          </div>
        </div>

        { activities_state.type === "video" && 
          <VideoForm />
        }
        { activities_state.type === "exercise" && 
          <ExerciseForm />
        }
        { activities_state.type === "game" && 
          <GameForm />
        }
        { activities_state.type === "audio" && 
          <AudioForm />
        }
        { activities_state.type === "question" &&
          <QuestionForm />
        }
        
      </div>
    </CardDiv>
  );
}
