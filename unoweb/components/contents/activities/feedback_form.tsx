import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import styled from "styled-components";
import { ActiveClassState } from "../../../redux/features/active_class";
import ActivitiesService from "../../../services/activities.service";
import ErrorModal from "../../utils/error_modal";
import LoadingModal from "../../utils/loading_modal";

const CardDiv = styled.div`
  position: relative;
`;

export default function FeedbackForm({
  student_id,
  activity_id,
  feedback,
  type,
}: {
  student_id: number;
  activity_id: number;
  feedback: string;
  type: string;
}) {
  const { id: class_id } = useSelector<RootState, ActiveClassState>(
    (state) => state.active_class
  );

  const [feedback_input, setFeedbackInput] = useState(feedback !== null ? feedback : "");
  const [mode, setMode] = useState(feedback !== null ? "view" : "edit");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const sendFeedback = async () => {
    setIsLoading(true);
    
    const change_order_response = await ActivitiesService.sendFeedback(
      class_id,
      activity_id,
      student_id,
      type,
      feedback_input
    );

    setIsLoading(false);

    if (change_order_response.error) {
      setErrorMessage(
        "Aconteceu um erro ao submeter o feedback. Por favor tente novamente."
      );
    } else {
      // Order changed successfully
      setMode("view");
    }
  };

  return (
    <>
      <div className="row g-3 mt-2 mb-4">
        <CardDiv className="container p-3 bg-white shadow-sm rounded">
          <div className="row">
            <div className="form-group mb-2">
              <label className="mb-2 primary-text" htmlFor="feedback">
                Feedback
              </label>
              { mode === "view" && 
                <p id="feedback">{feedback_input}</p>
              }
              { mode === "edit" && 
                <input
                type="text"
                className="form-control"
                id="feedback"
                placeholder="Escreva o feedback"
                onChange={(event) => setFeedbackInput(event.target.value)}
                value={feedback_input}
              />
              }
              { mode === "view" &&
                <button className="btn btn-warning" onClick={() => setMode("edit")}>{"Editar feedback"}</button>
              }
              { mode === "edit" && 
                <div className="d-flex justify-content-center d-grid gap-3 mt-2 mt-sm-0">
                  <div>
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        sendFeedback();
                        setMode("view");
                      }}
                    >
                      Confirmar
                    </button>
                  </div>
                  <div>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        setMode("view");
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              }
            </div>

          </div>
        </CardDiv>
      </div>
      <ErrorModal
        show={errorMessage !== ""}
        onHide={() => setErrorMessage("")}
        message={errorMessage}
      />
      {isLoading && <LoadingModal />}
    </>
  );
}
