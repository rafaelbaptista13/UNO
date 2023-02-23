import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import ActivityCard from "../../../../../components/contents/activity_card";
import ErrorCard from "../../../../../components/utils/error_card";
import { ButtonPrimary } from "../../../../../utils/buttons";
import ErrorModal from "../../../../../components/utils/error_modal";
import LoadingModal from "../../../../../components/utils/loading_modal";
import SuccessModal from "../../../../../components/utils/success_modal";
import ConfirmActionModal from "../../../../../components/utils/confirm_action_modal";
import ActivitiesService from "../../../../../services/activities.service";
import ActivityGroupsService from "../../../../../services/activitygroups.service";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux/store";
import { ActiveClassState } from "../../../../../redux/features/active_class";
import Loading from "../../../../../components/utils/loading";
import ActivitiesHeader from "../../../../../components/contents/activities_header";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import DraggableActivityCard from "../../../../../components/contents/draggable_activity_card";

export type ActivitiesType = {
  id: number;
  type: string;
  order: number;
  activitygroup_id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
};

interface EditGroupProps {
  activitygroup_id: number;
}

export const activities_type: { [type: string]: string } = {
  video: "Vídeo",
  exercise: "Exercício",
  game: "Jogo",
  audio: "Áudio",
  question: "Pergunta",
};

export default function EditGroup({ activitygroup_id }: EditGroupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmActionActivity, setConfirmActionActivity] = useState({
    id: -1,
    order: -1,
  });
  const { id: class_id } = useSelector<RootState, ActiveClassState>(
    (state) => state.active_class
  );
  const [groupInfo, setGroupInfo] = useState({ order: 0, name: "" });
  const [error, setError] = useState(false);
  const [activities, setActivities] = useState<Array<ActivitiesType>>([]);
  const [view, setView] = useState("normal");

  const updateActivityGroupName = async ({
    id,
    name,
  }: {
    id: number;
    name: string;
  }) => {
    setIsLoading(true);

    const update_activitygroup_name_response =
      await ActivityGroupsService.updateActivityGroup(class_id, id, name);

    setIsLoading(false);

    if (update_activitygroup_name_response.error) {
      setErrorMessage(
        "Aconteceu um erro ao atualizar o nome do grupo de atividades. Por favor tente novamente."
      );
    } else {
      setGroupInfo({ order: groupInfo.order, name: name });
    }
  };

  const deleteActivity = async ({
    id,
    order,
  }: {
    id: number;
    order: number;
  }) => {
    setIsLoading(true);

    const delete_activity_response = await ActivitiesService.deleteActivity(
      class_id,
      id,
      activitygroup_id
    );

    setIsLoading(false);

    if (delete_activity_response.error) {
      // An error occured
      setErrorMessage(
        "Aconteceu um erro ao apagar a atividade. Por favor tente novamente."
      );
    } else {
      // Activity deleted successfully
      setSuccessMessage(
        "A atividade " + order + " foi eliminada com sucesso!"
      );
      let _activities = activities;
      _activities.splice(order - 1, 1);
      for (let idx = order - 1; idx < _activities.length; idx++) {
        _activities[idx].order -= 1;
      }
      setActivities(_activities);
    }
    setConfirmActionActivity({ id: -1, order: -1 });
  };

  const changeOrder = async () => {
    setIsLoading(true);

    let new_order = activities.map((item) => item.id);
    const change_order_response = await ActivitiesService.changeOrder(
      class_id,
      activitygroup_id,
      new_order
    );

    setIsLoading(false);

    if (change_order_response.error) {
      setErrorMessage(
        "Aconteceu um erro ao editar a ordem dos grupos de atividades. Por favor tente novamente."
      );
    } else {
      // Order changed successfully
      setView("normal");
    }
  };

  useEffect(() => {
    setIsPageLoading(true);
    ActivityGroupsService.getActivityGroup(class_id, activitygroup_id)
      .then((data) => {
        setGroupInfo({ order: data.order, name: data.name });
        ActivitiesService.getActivities(class_id, activitygroup_id)
          .then((data) => {
            setActivities(data);
          })
          .catch((err) => {
            setActivities([]);
            setError(true);
          });
      })
      .catch((err) => {
        setActivities([]);
        setError(true);
      })
      .finally(() => {
        setIsPageLoading(false);
      });
  }, [class_id, activitygroup_id]);

  if (isPageLoading) {
    return <Loading />;
  }

  const reorder = (startIndex: number, endIndex: number) => {
    const [removed] = activities.splice(startIndex, 1);
    activities.splice(endIndex, 0, removed);

    return activities;
  };

  const onDragEnd = (result: any) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(result.source.index, result.destination.index);
    console.log(items);
    setActivities(items);
  };

  return (
    <>
      <Head>
        <title>UNO - Conteúdos</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container px-4">
        <div className="row g-3 mt-2 mb-4">
          <ActivitiesHeader
            id={activitygroup_id}
            name={groupInfo.name}
            activitygroup_id={activitygroup_id}
            update_action={updateActivityGroupName}
            order={groupInfo.order}
            view={view}
            set_view={setView}
            change_order={changeOrder}
          />
        </div>
        {error && (
          <div className="row g-3 my-2">
            <ErrorCard message="Ocorreu um erro ao obter as atividades. Por favor tente novamente." />
          </div>
        )}

        {(view === "normal" || view === "edit_name") && (
          <>
            {activities.map(function (activity: ActivitiesType, index) {
              return (
                <div className="row g-3 my-1" key={activity.id}>
                  <ActivityCard
                    activitygroup_id={activitygroup_id}
                    activity_id={activity.id}
                    num={index + 1}
                    title={activity.title}
                    type={activity.type}
                    description={activities_type[activity.type]}
                    setConfirmActionActivity={setConfirmActionActivity}
                  />
                </div>
              );
            })}
          </>
        )}

        {view === "edit_order" &&
          <>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {activities.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            className="row g-3 my-1"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <DraggableActivityCard
                              num={index + 1}
                              title={item.title}
                              type={item.type}
                              description={activities_type[item.type]}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </>
        }

        <div className="row g-3 my-2">
          <div className="col gap-3 d-flex justify-content-end">
            <Link href={`/contents/groups`}>
              <ButtonPrimary>Voltar para o plano de aulas</ButtonPrimary>
            </Link>
          </div>
        </div>
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
        show={confirmActionActivity.id !== -1}
        onHide={() =>
          setConfirmActionActivity({ id: -1, order: -1 })
        }
        confirmAction={() => deleteActivity(confirmActionActivity)}
        message={
          "Tem a certeza que pretende eliminar a atividade " +
          confirmActionActivity.order +
          "?"
        }
      />
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
