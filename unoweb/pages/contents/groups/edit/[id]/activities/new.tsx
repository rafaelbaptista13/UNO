import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import PageHeader from "../../../../../../components/utils/page_header";
import { useDispatch, useSelector } from "react-redux";
import {
  ActivitiesState,
  setType,
} from "../../../../../../redux/features/activitiesSlice";
import { useState } from "react";
import ErrorModal from "../../../../../../components/utils/error_modal";
import SuccessModal from "../../../../../../components/utils/success_modal";
import LoadingModal from "../../../../../../components/utils/loading_modal";
import { activities_type } from "../index";
import { RootState } from "../../../../../../redux/store";
import ChooseNewActivityType from "../../../../../../components/contents/activityform/choose_new_activity_type";
import MediaForm from "../../../../../../components/contents/activityform/media_form";
import ExerciseForm from "../../../../../../components/contents/activityform/exercise_form";
import GameForm from "../../../../../../components/contents/activityform/game_form";
import QuestionForm from "../../../../../../components/contents/activityform/question_form";

interface NewActivityProps {
  activitygroup_id: number;
}

export default function NewActivity({ activitygroup_id }: NewActivityProps) {
  const activities_state = useSelector<RootState, ActivitiesState>(
    (state) => state.activities
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  return (
    <>
      <Head>
        <title>UNO - Conteúdos</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container px-4">
        <div className="row g-3 mt-2 mb-4">
          {activities_state.type !== "" ? (
            <PageHeader
              header_text={
                "Nova Atividade - " + activities_type[activities_state.type]
              }
            />
          ) : (
            <PageHeader header_text={"Nova Atividade"} />
          )}
        </div>

        {activities_state.type === "" ? (
          <>
            <div className="row g-3 mt-2 mb-4">
              <ChooseNewActivityType />
            </div>
            <div className="row g-3 my-2">
              <div className="col gap-3 d-flex justify-content-end">
                <Link href={`/contents/groups/edit/${activitygroup_id}`}>
                  <button className="btn btn-danger">Cancelar</button>
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            {activities_state.type === "Media" && (
              <MediaForm
                setIsLoading={setIsLoading}
                setErrorMessage={setErrorMessage}
                setSuccessMessage={setSuccessMessage}
                activitygroup_id={activitygroup_id}
              />
            )}
            {activities_state.type === "Exercise" && (
              <ExerciseForm
                setIsLoading={setIsLoading}
                setErrorMessage={setErrorMessage}
                setSuccessMessage={setSuccessMessage}
                activitygroup_id={activitygroup_id}
              />
            )}
            {activities_state.type === "Game" && (
              <GameForm
                setIsLoading={setIsLoading}
                setErrorMessage={setErrorMessage}
                setSuccessMessage={setSuccessMessage}
                activitygroup_id={activitygroup_id}
              />
            )}
            {activities_state.type === "Question" && (
              <QuestionForm
                setIsLoading={setIsLoading}
                setErrorMessage={setErrorMessage}
                setSuccessMessage={setSuccessMessage}
                activitygroup_id={activitygroup_id}
              />
            )}
          </>
        )}
      </div>

      <ErrorModal
        show={errorMessage !== ""}
        onHide={() => setErrorMessage("")}
        message={errorMessage}
      />
      <SuccessModal
        show={successMessage !== ""}
        onHide={() => {
          setSuccessMessage("");
          dispatch(setType(""));
        }}
        message={successMessage}
        button_link_path={`/contents/groups/edit/${activitygroup_id}`}
      />
      {isLoading && <LoadingModal />}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const activitygroup_id = context.query.id;

  return {
    props: {
      activitygroup_id: activitygroup_id,
    },
  };
};
