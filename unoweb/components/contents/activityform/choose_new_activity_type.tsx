import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { ActivitiesState, setType } from "../../../redux/features/activitiesSlice";
import { RootState } from "../../../redux/store";

const CardDiv = styled.div`
  position: relative;
`;

export default function ChooseNewActivityType() {
  const dispatch = useDispatch();
  const activities_state = useSelector<RootState, ActivitiesState>((state) => state.activities);

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
              <option value={""}>Escolha o tipo de atividade...</option>
              <option value={"Media"}>Conteúdo</option>
              <option value={"Exercise"}>Exercício</option>
              <option value={"Game"}>Jogo A Cor do Som</option>
              <option value={"Question"}>Pergunta</option>
            </select>
          </div>
        </div>
        
      </div>
    </CardDiv>
  );
}
