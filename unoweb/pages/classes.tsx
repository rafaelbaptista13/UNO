import axios from "axios";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useState } from "react";
import ClassCard from "../components/classes/class_card";
import NewCardWithTextInput from "../components/contents/new_card_with_text_input";
import ConfirmActionModal from "../components/utils/confirm_action_modal";
import ErrorCard from "../components/utils/error_card";
import ErrorModal from "../components/utils/error_modal";
import LoadingModal from "../components/utils/loading_modal";
import PageHeaderButtonCard from "../components/utils/page_header_button_card";
import SuccessModal from "../components/utils/success_modal";
import { web_server } from "../config";
import ClassesService from "../services/classes.service";

export type ClassesType = {
  id: number;
  name: string;
  code: string;
};

interface ClassesProps {
  teacher_classes: Array<ClassesType>;
  error?: boolean;
}

export default function Classes({ teacher_classes, error }: ClassesProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmActionClass, setConfirmActionClass] = useState({
    id: -1,
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [teacherClasses, setTeacherClasses] = useState(teacher_classes);
  const [newClassMode, setNewClassMode] = useState(false);

  const createNewClass = async (name: string) => {
    setIsLoading(true);

    const new_class_response = await ClassesService.createClass(name);

    setIsLoading(false);

    if (new_class_response.error) {
      // An error occured
      setErrorMessage(
        "Aconteceu um erro ao criar uma nova turma. Por favor tente novamente."
      );
    } else {
      // Class created successfully
      teacherClasses.push(new_class_response);
      setTeacherClasses([...teacherClasses]);
      setSuccessMessage(
        "A turma com o nome " +
          new_class_response.name +
          " foi criada com sucesso! Atualize a página para ver as atualizações."
      );
    }
  };

  const updateClass = async ({ id, name }: { id: number; name: string }) => {
    setIsLoading(true);

    const update_class_response = await ClassesService.updateClass(id, name);

    setIsLoading(false);

    if (update_class_response.error) {
      // An error occured
      setErrorMessage(
        "Aconteceu um erro ao atualizar a atividade. Por favor tente novamente."
      );
    } else {
      let _teacherClasses = teacherClasses;
      let idx = teacherClasses.findIndex((obj) => obj.id == id);
      _teacherClasses[idx].name = name;
      setTeacherClasses(_teacherClasses);
    }
  };

  const deleteClass = async ({ id, name }: { id: number; name: string }) => {
    setIsLoading(true);

    const delete_class_response = await ClassesService.deleteClass(id);

    setIsLoading(false);

    if (delete_class_response.error) {
      // An error occured
      setErrorMessage(
        "Aconteceu um erro ao apagar uma turma. Por favor tente novamente."
      );
    } else {
      // Class deleted successfully
      setSuccessMessage(
        "A turma com o nome " + name + " foi eliminada com sucesso!"
      );

      setTeacherClasses(teacherClasses.filter((item) => item.id !== id));
    }
    setConfirmActionClass({ id: -1, name: "" });
  };

  return (
    <>
      <Head>
        <title>UNO - Suas turmas</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container px-4">
        <div className="row g-3 mt-2 mb-4">
          <PageHeaderButtonCard
            header_text="As suas turmas"
            button_text="Nova turma"
            button_action={() => setNewClassMode(true)}
          />
        </div>
        {error && (
          <div className="row g-3 my-2">
            <ErrorCard message="Ocorreu um erro ao obter os conteúdos semanais. Por favor tente novamente." />
          </div>
        )}
        {newClassMode && (
          <div className="row g-3 my-2">
            <NewCardWithTextInput
              confirm={createNewClass}
              cancel={() => setNewClassMode(false)}
            />
          </div>
        )}
        {teacherClasses.map(function (class_item: ClassesType, index) {
          return (
            <div className="row g-3 my-1" key={class_item.id}>
              <ClassCard
                id={class_item.id}
                name={class_item.name}
                class_code={class_item.code}
                setConfirmActionClass={setConfirmActionClass}
                updateAction={updateClass}
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
        show={confirmActionClass.id !== -1}
        onHide={() => setConfirmActionClass({ id: -1, name: "" })}
        confirmAction={() => deleteClass(confirmActionClass)}
        message={
          "Tem a certeza que pretende eliminar a turma " +
          confirmActionClass.name +
          " e todos os seus conteúdos associados?"
        }
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = context.req.headers.cookie;

  let teacher_classes_request;
  try {
    teacher_classes_request = await axios.get(`${web_server}/api/classes`, {
      headers: {
        Cookie: cookies,
      },
    });
  } catch (e) {
    console.log(e);
    return {
      props: {
        teacher_classes: [],
        error: true,
      },
    };
  }

  // Handle error
  if (teacher_classes_request.status !== 200) {
    console.log(teacher_classes_request);
    return {
      props: {
        teacher_classes: [],
        error: true,
      },
    };
  }

  const teacher_classes_response = teacher_classes_request.data;

  return {
    props: {
      teacher_classes: teacher_classes_response,
    },
  };
};