import Head from "next/head";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ContentCard from "../../../components/contents/content_card";
import ConfirmActionModal from "../../../components/utils/confirm_action_modal";
import ErrorCard from "../../../components/utils/error_card";
import ErrorModal from "../../../components/utils/error_modal";
import Loading from "../../../components/utils/loading";
import LoadingModal from "../../../components/utils/loading_modal";
import PageHeaderButtonCard from "../../../components/utils/page_header_button_card";
import SuccessModal from "../../../components/utils/success_modal";
import { ActiveClassState } from "../../../redux/features/active_class";
import { RootState } from "../../../redux/store";
import WeeksService from "../../../services/weeks.service";

export type ContentsWeeksType = {
  id: number;
  week_number: number;
  number_of_videos: number;
  number_of_exercises: number;
  createdAt: string;
  updatedAt: string;
};

export default function ContentsWeek() {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmActionWeek, setConfirmActionWeek] = useState({
    week_id: -1,
    week_number: -1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [contentsWeeks, setContentsWeeks] = useState<Array<ContentsWeeksType>>([]);
  const [error, setError] = useState(false);
  const { id: class_id } = useSelector<RootState, ActiveClassState>(
    (state) => state.active_class
  );

  const createNewWeek = async () => {
    setIsLoading(true);

    const new_week_response = await WeeksService.createWeek(class_id, 0, 0);

    setIsLoading(false);

    if (new_week_response.error) {
      // An error occured
      setErrorMessage(
        "Aconteceu um erro ao criar uma nova semana de conteúdos. Por favor tente novamente."
      );
    } else {
      // Week created successfully
      contentsWeeks.push(new_week_response);
      setContentsWeeks([...contentsWeeks]);
      setSuccessMessage(
        "A semana de conteúdos " +
          new_week_response.week_number +
          " foi criada com sucesso!"
      );
    }
  };

  const deleteWeek = async ({
    week_id,
    week_number,
  }: {
    week_id: number;
    week_number: number;
  }) => {
    setIsLoading(true);

    const delete_week_response = await WeeksService.deleteWeek(class_id, week_id);

    setIsLoading(false);

    if (delete_week_response.error) {
      // An error occured
      setErrorMessage(
        "Aconteceu um erro ao apagar uma semana de conteúdos. Por favor tente novamente."
      );
    } else {
      // Week deleted successfully
      setSuccessMessage(
        "A semana de conteúdos " + week_number + " foi eliminada com sucesso!"
      );
      let contents_weeks = contentsWeeks;
      contents_weeks.splice(week_number - 1, 1);
      for (let idx = week_number - 1; idx < contents_weeks.length; idx++) {
        contents_weeks[idx].week_number -= 1;
      }
      setContentsWeeks(contents_weeks);
    }
    setConfirmActionWeek({ week_id: -1, week_number: -1 });
  };

  useEffect(() => {
    setIsPageLoading(true);
    WeeksService.getWeeks(class_id)
      .then((data) => {
        setError(false);
        setContentsWeeks(data);
      })
      .catch((err) => {
        setError(true);
      })
      .finally(() => {
        setIsPageLoading(false);
      });
  }, [class_id]);

  return (
    <>
      <Head>
        <title>UNO - Conteúdos</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container px-4">
        <div className="row g-3 mt-2 mb-4">
          <PageHeaderButtonCard
            header_text="Conteúdos Semanais"
            button_text="Nova semana"
            button_action={createNewWeek}
          />
        </div>
        {error && (
          <div className="row g-3 my-2">
            <ErrorCard message="Ocorreu um erro ao obter os conteúdos semanais. Por favor tente novamente." />
          </div>
        )}
        {contentsWeeks.map(function (contents_week: ContentsWeeksType, index) {
          return (
            <div className="row g-3 my-1" key={contents_week.id}>
              <ContentCard
                id={contents_week.id}
                week_number={contents_week.week_number}
                setConfirmActionWeek={setConfirmActionWeek}
              />
            </div>
          );
        })}
      </div>

      <ErrorModal
        show={errorMessage !== ""}
        onHide={() => setErrorMessage("")}
        message={errorMessage}
      />
      <SuccessModal
        show={successMessage !== ""}
        onHide={() => setSuccessMessage("")}
        message={successMessage}
      />
      {isLoading && <LoadingModal />}
      <ConfirmActionModal
        show={confirmActionWeek.week_id !== -1}
        onHide={() => setConfirmActionWeek({ week_id: -1, week_number: -1 })}
        confirmAction={() => deleteWeek(confirmActionWeek)}
        message={
          "Tem a certeza que pretende eliminar a semana " +
          confirmActionWeek.week_number +
          "?"
        }
      />
      {isPageLoading && <Loading />}
    </>
  );
}