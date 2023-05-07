import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import styled from "styled-components";
import { ActiveClassState } from "../../../redux/features/active_class";
import ActivitiesService from "../../../services/activities.service";
import TrophiesService from "../../../services/trophies.service";
import ErrorModal from "../../utils/error_modal";
import LoadingModal from "../../utils/loading_modal";
import Image from "next/image";
import getBasePath from "../../utils/basePath";
import Loading from "../../utils/loading";

const CardDiv = styled.div`
  position: relative;
`;

interface TrophyType {
  id: number;
  name: string;
}

export default function FeedbackForm({
  student_id,
  activity_id,
  feedback,
  trophy,
  type,
}: {
  student_id: number;
  activity_id: number;
  feedback: string;
  trophy: TrophyType | null;
  type: string;
}) {
  const { id: class_id } = useSelector<RootState, ActiveClassState>(
    (state) => state.active_class
  );
  const basePath = getBasePath();

  const [feedback_input, setFeedbackInput] = useState(feedback !== null ? feedback : "");
  const [mode, setMode] = useState(feedback !== null ? "view" : "edit");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [error, setError] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);

  const [trophies, setTrophies] = useState<TrophyType[]>([]);
  const [chosenTrophie, setChosenTrophie] = useState(trophy !== null ? trophy.id : -1);
  
  const sendFeedback = async () => {
    setIsLoading(true);
    console.log(chosenTrophie);
    const change_order_response = await ActivitiesService.sendFeedback(
      class_id,
      activity_id,
      student_id,
      type,
      feedback_input,
      chosenTrophie
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

  useEffect(() => {
    setIsPageLoading(true);
    // Get available trophies
    TrophiesService.getAvailableTrophies(class_id, student_id)
      .then((data) => {
        if (trophy !== null) {
          setTrophies([trophy, ...data]);
        } else {
          setTrophies(data);
        }
      })
      .catch((err) => {
        setError(true);
      })
      .finally(() => {
        setIsPageLoading(false);
      });
  }, [class_id, student_id, trophy])

  if (isPageLoading) return <Loading />;

  if (error) return (
    <div>
      Ocorreu um erro ao obter os troféus.
    </div>
  )

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
                <p style={{ wordBreak: "break-word" }} id="feedback">{feedback_input}</p>
              }
              { mode === "edit" && 
                <textarea
                  className="form-control mb-2"
                  id="feedback"
                  rows={3}
                  placeholder="Escreva o feedback"
                  maxLength={500}
                  onChange={(event) => setFeedbackInput(event.target.value)}
                  value={feedback_input}
                />
              }
              <label className="mb-2 primary-text" htmlFor="trophie">
                Troféu
              </label>
              { mode === "view" && 
                <>
                  { chosenTrophie != -1 ?
                    (
                      <>
                        <p style={{ wordBreak: "break-word" }} id="trophie">{trophies.find(obj => obj.id === chosenTrophie)?.name}</p>
                        <Image 
                          src={basePath + "/img/trophies/" + chosenTrophie + ".png"}
                          alt={""}        
                          width={100}    
                          height={100}      
                        />
                        <br />
                      </>
                    ) : (
                      <p style={{ wordBreak: "break-word" }} id="trophie">{"Sem prémio."}</p>
                  )}
                </>
              }
              { mode === "edit" && 
                <>
                  <select className="form-control mb-2" id="trophie" value={chosenTrophie} onChange={(e) => setChosenTrophie(parseInt(e.target.value))}>
                    <option value={-1}>Sem prémio.</option>
                    {trophies.map((trophie) => {
                      return (
                        <option key={trophie.id} value={trophie.id}>{trophie.name}</option>
                      )
                    })}
                  </select>
                  {chosenTrophie !== -1 &&
                    <Image 
                      src={basePath + "/img/trophies/" + chosenTrophie + ".png"}
                      alt={""}        
                      width={100}    
                      height={100}      
                    />
                  }
                </>
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
