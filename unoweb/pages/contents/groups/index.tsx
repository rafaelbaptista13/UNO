import Head from "next/head";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ContentCard from "../../../components/contents/content_card";
import NewCardWithTextInput from "../../../components/contents/new_card_with_text_input";
import ConfirmActionModal from "../../../components/utils/confirm_action_modal";
import ErrorCard from "../../../components/utils/error_card";
import ErrorModal from "../../../components/utils/error_modal";
import Loading from "../../../components/utils/loading";
import LoadingModal from "../../../components/utils/loading_modal";
import SuccessModal from "../../../components/utils/success_modal";
import { ActiveClassState } from "../../../redux/features/active_class";
import { RootState } from "../../../redux/store";
import ActivityGroupsService from "../../../services/activitygroups.service";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DraggableContentCard from "../../../components/contents/draggable_content_card";
import ActivityGroupsHeader from "../../../components/contents/activitygroups_header";

export type ActivityGroupsType = {
  id: number;
  name: string;
  order: number;
  number_of_videos: number;
  number_of_exercises: number;
  createdAt: string;
  updatedAt: string;
};

export default function ActivityGroup() {
  // On Page Load
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState(false);

  // On User interaction
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState({
    activitygroup_id: -1,
    order: -1,
  });
  const [newActivityGroupMode, setNewActivityGroupMode] = useState(false);
  const [view, setView] = useState("normal");

  // Page Data
  const [activityGroups, setActivityGroups] = useState<
    Array<ActivityGroupsType>
  >([]);

  // Class state (Redux)
  const { id: class_id } = useSelector<RootState, ActiveClassState>(
    (state) => state.active_class
  );

  const createNewActivityGroup = async (name: string) => {
    setIsLoading(true);

    const new_activitygroup_response =
      await ActivityGroupsService.createActivityGroup(class_id, name);

    setIsLoading(false);

    if (new_activitygroup_response.error) {
      // An error occured
      setErrorMessage(
        "Aconteceu um erro ao criar um novo grupo de atividades. Por favor tente novamente."
      );
    } else {
      // ActivityGroup created successfully
      activityGroups.push(new_activitygroup_response);
      setActivityGroups([...activityGroups]);
      setSuccessMessage(
        "O grupo de atividades com o nome " +
          new_activitygroup_response.name +
          " foi criado com sucesso!"
      );
    }
  };

  const deleteActivityGroup = async ({
    activitygroup_id,
    order,
  }: {
    activitygroup_id: number;
    order: number;
  }) => {
    setIsLoading(true);

    const delete_activitygroup_response =
      await ActivityGroupsService.deleteActivityGroup(
        class_id,
        activitygroup_id
      );

    setIsLoading(false);

    if (delete_activitygroup_response.error) {
      // An error occured
      setErrorMessage(
        "Aconteceu um erro ao apagar o grupo de atividades. Por favor tente novamente."
      );
    } else {
      // ActivityGroup deleted successfully
      setSuccessMessage(
        "O grupo de atividades " + order + " foi eliminado com sucesso!"
      );
      let _activityGroups = activityGroups;
      _activityGroups.splice(order - 1, 1);
      for (let idx = order - 1; idx < _activityGroups.length; idx++) {
        _activityGroups[idx].order -= 1;
      }
      setActivityGroups(_activityGroups);
    }
    setConfirmDeleteGroup({ activitygroup_id: -1, order: -1 });
  };

  const changeOrder = async () => {
    setIsLoading(true);

    let new_order = activityGroups.map((item) => item.id);
    const change_order_response = await ActivityGroupsService.changeOrder(class_id, new_order);

    setIsLoading(false);

    if (change_order_response.error) {
      setErrorMessage(
        "Aconteceu um erro ao editar a ordem dos grupos de atividades. Por favor tente novamente."
      );
    } else {
      // Order changed successfully
      setView("normal");
    }
  }

  useEffect(() => {
    setIsPageLoading(true);
    ActivityGroupsService.getActivityGroups(class_id)
      .then((data) => {
        setActivityGroups(data);
      })
      .catch((err) => {
        setError(true);
      })
      .finally(() => {
        setIsPageLoading(false);
      });
  }, [class_id]);

  if (isPageLoading) return <Loading />;

  const reorder = (startIndex: number, endIndex: number) => {
    const [removed] = activityGroups.splice(startIndex, 1);
    activityGroups.splice(endIndex, 0, removed);

    return activityGroups;
  };

  const onDragEnd = (result: any) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(result.source.index, result.destination.index);
    console.log(items);
    setActivityGroups(items);
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
          <ActivityGroupsHeader
            header_text="Grupos de atividades"
            button_text="Novo grupo"
            set_new_activitygroup_view={setNewActivityGroupMode}
            set_order_view={setView}
            view={view}
            confirm_action={changeOrder}
          />
        </div>
        {error && (
          <div className="row g-3 my-2">
            <ErrorCard message="Ocorreu um erro ao obter os grupos de atividades. Por favor tente novamente." />
          </div>
        )}
        {newActivityGroupMode && (
          <div className="row g-3 my-1">
            <NewCardWithTextInput
              confirm={createNewActivityGroup}
              cancel={() => setNewActivityGroupMode(false)}
            />
          </div>
        )}

        {view === "normal" && (
          <>
            {activityGroups.map(function (
              activityGroup: ActivityGroupsType,
              index
            ) {
              return (
                <div className="row g-3 my-1" key={activityGroup.id}>
                  <ContentCard
                    id={activityGroup.id}
                    name={activityGroup.name}
                    order={index+1}
                    setConfirmActionWeek={setConfirmDeleteGroup}
                  />
                </div>
              );
            })}
          </>
        )}

        {view === "edit_order" && (
          <>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {activityGroups.map((item, index) => (
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
                            <DraggableContentCard
                              id={item.id}
                              name={item.name}
                              order={index + 1}
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
        )}
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
        show={confirmDeleteGroup.activitygroup_id !== -1}
        onHide={() =>
          setConfirmDeleteGroup({ activitygroup_id: -1, order: -1 })
        }
        confirmAction={() => deleteActivityGroup(confirmDeleteGroup)}
        message={
          "Tem a certeza que pretende eliminar o grupo de atividades " +
          confirmDeleteGroup.order +
          "?"
        }
      />
    </>
  );
}
