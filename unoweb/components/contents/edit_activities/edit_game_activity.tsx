import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import styled from "styled-components";
import { ActiveClassState } from "../../../redux/features/active_class";
import ActivitiesService from "../../../services/activities.service";
import Loading from "../../utils/loading";
import ErrorCard from "../../utils/error_card";
import { GameActivityType } from "../../../pages/contents/groups/[id]/students/[student_id]/activities/[activity_id]";
import { musical_notes } from "../../utils/game_utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const CardDiv = styled.div`
  position: relative;
`;

interface GameModeTypes {
  [key: string]: string;
}

const game_modes: GameModeTypes = {
  Play: "Reproduzir",
  Identify: "Identificar",
  Build: "Construir",
};

interface Note {
  name: string;
  violin_string: number;
  violin_finger: number;
  viola_string: number;
  viola_finger: number;
  note_code: string;
  type: string;
}

interface NoteTypes {
  [key: string]: string;
}

const note_types: NoteTypes = {
  Circle: "\u25CF",
  RightTriangle: "\u25BA",
  LeftTriangle: "\u25C4",
};

export default function EditGameActivity({
  activity_id,
  description,
  game_info,
  setIsLoading,
  setErrorMessage,
  setSuccessMessage,
  activitygroup_id,
}: {
  activity_id: number;
  description: string | null;
  game_info: GameActivityType;
  setIsLoading: (value: boolean) => void;
  setErrorMessage: (value: string) => void;
  setSuccessMessage: (value: string) => void;
  activitygroup_id: number;
}) {
  const { id: class_id } = useSelector<RootState, ActiveClassState>(
    (state) => state.active_class
  );

  const [notes, setNotes] = useState<Note[]>(game_info.notes);

  // Description
  const [input_description, setInputDescription] = useState(
    description != null ? description : ""
  );

  // Sequence Length input for game type Build
  const [sequence_length, setSequenceLength] = useState(
    game_info.mode === "Build" ? game_info.sequence_length!! : 1
  );

  // New note
  const [note_name, setNoteName] = useState("");
  const [note_code, setNoteCode] = useState("A0");
  const [note_violin_string, setNoteViolinString] = useState(1);
  const [note_violin_finger, setNoteViolinFinger] = useState(0);
  const [note_viola_string, setNoteViolaString] = useState(1);
  const [note_viola_finger, setNoteViolaFinger] = useState(0);
  const [note_type, setNoteType] = useState("Circle");

  // Handle adding new note
  const addNewNote = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    const new_note = {
      name: note_name,
      note_code: note_code,
      violin_string: note_violin_string,
      violin_finger: note_violin_finger,
      viola_string: note_viola_string,
      viola_finger: note_viola_finger,
      type: note_type,
    };

    const _notes = [...notes, new_note];
    setNotes(_notes);
  };

  // Handle removing a note
  const removeNote = (index: number) => {
    const _notes = [...notes];
    _notes.splice(index, 1);
    setNotes(_notes);
  };

  const editGameActivity = async () => {
    setIsLoading(true);

    const edit_activity_response = await ActivitiesService.updateGameActivity(
      class_id,
      activity_id,
      input_description,
      notes,
      sequence_length
    );

    setIsLoading(false);

    if (edit_activity_response.error) {
      // An error occured
      setErrorMessage(
        "Aconteceu um erro ao editar a atividade. Por favor tente novamente."
      );
    } else {
      // Activity created successfully
      setSuccessMessage("A atividade do tipo Jogo foi editada com sucesso!");
    }
  };

  return (
    <>
      <div className="row g-3 mt-2 mb-4">
        <CardDiv className="container p-3 bg-white shadow-sm rounded">
          <div className="row">
            <div className="form-group col-xl-4">
              <label className="mb-2 primary-text" htmlFor="game_mode_input">
                Modo de jogo
              </label>
              <p id="mode">{game_modes[game_info.mode]}</p>
            </div>

            <div className="form-group mb-2 col-xl-4">
              <label className="mb-2 primary-text" htmlFor="description_input">
                {"Descrição (Opcional)"}
              </label>
              <textarea
                className="form-control"
                id="description_input"
                rows={1}
                value={input_description}
                maxLength={250}
                onChange={(e) => setInputDescription(e.target.value)}
              ></textarea>
            </div>

            {game_info.mode === "Build" && (
              <div className="form-group mb-2 col-xl-4">
                <label
                  className="mb-2 primary-text"
                  htmlFor="sequence_length_input"
                >
                  Comprimento da sequência
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="sequence_length_input"
                  placeholder="Defina o comprimento da sequência de notas"
                  value={sequence_length}
                  onChange={(elem) =>
                    setSequenceLength(parseInt(elem.target.value))
                  }
                />
              </div>
            )}

            <div className="mb-2 col-xl-11">
              <label className="mb-2 primary-text">
                {(game_info.mode === "Identify" || game_info.mode === "Play") &&
                  "Sequência de notas"}
                {game_info.mode === "Build" && "Notas disponíveis"}
              </label>
              <form onSubmit={addNewNote}>
                <div className="container g-1 text-center">
                  <div className="row mb-2">
                    <div className="col-3 col-lg-1 mb-2 align-self-end">
                      <label className="primary-text" htmlFor="name_input">
                        Nome
                      </label>
                      <input
                        type={"text"}
                        id={"name_input"}
                        className="form-control"
                        value={note_name}
                        onChange={(elem) => setNoteName(elem.target.value)}
                        required
                      />
                    </div>

                    <div className="col-3 col-lg-2 mb-2 align-self-end">
                      <label className="primary-text" htmlFor="note_input">
                        Nota
                      </label>
                      <select
                        className="form-select"
                        id="note_input"
                        value={note_code}
                        onChange={(elem) => setNoteCode(elem.target.value)}
                        required
                      >
                        {musical_notes.map(function (elem, index) {
                          return (
                            <option key={elem} value={elem}>
                              {elem}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="col-6 col-lg-3 mb-2">
                      <div className="row primary-text">
                        <label>Violino</label>
                      </div>
                      <div className="row">
                        <div className="col">
                          <label
                            className="primary-text"
                            htmlFor="string_violin_input"
                          >
                            Corda
                          </label>
                          <select
                            className="form-select"
                            id="string_violin_input"
                            value={note_violin_string}
                            onChange={(elem) =>
                              setNoteViolinString(parseInt(elem.target.value))
                            }
                            required
                          >
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                          </select>
                        </div>
                        <div className="col">
                          <label
                            className="primary-text"
                            htmlFor="finger_violin_input"
                          >
                            Dedo
                          </label>
                          <select
                            className="form-select"
                            id="finger_violin_input"
                            value={note_violin_finger}
                            onChange={(elem) =>
                              setNoteViolinFinger(parseInt(elem.target.value))
                            }
                            required
                          >
                            <option value={"0"}>0</option>
                            <option value={"1"}>1</option>
                            <option value={"2"}>2</option>
                            <option value={"3"}>3</option>
                            <option value={"4"}>4</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="col-6 col-lg-3 mb-2">
                      <div className="row primary-text">
                        <label>Viola</label>
                      </div>
                      <div className="row">
                        <div className="col">
                          <label
                            className="primary-text"
                            htmlFor="string_viola_input"
                          >
                            Corda
                          </label>
                          <select
                            className="form-select"
                            id="string_viola_input"
                            value={note_viola_string}
                            onChange={(elem) =>
                              setNoteViolaString(parseInt(elem.target.value))
                            }
                            required
                          >
                            <option value={"1"}>1</option>
                            <option value={"2"}>2</option>
                            <option value={"3"}>3</option>
                            <option value={"4"}>4</option>
                          </select>
                        </div>
                        <div className="col">
                          <label
                            className="primary-text"
                            htmlFor="finger_viola_input"
                          >
                            Dedo
                          </label>
                          <select
                            className="form-select"
                            id="finger_viola_input"
                            value={note_viola_finger}
                            onChange={(elem) =>
                              setNoteViolaFinger(parseInt(elem.target.value))
                            }
                            required
                          >
                            <option value={"0"}>0</option>
                            <option value={"1"}>1</option>
                            <option value={"2"}>2</option>
                            <option value={"3"}>3</option>
                            <option value={"4"}>4</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="col-3 col-lg-2 mb-2 align-self-end">
                      <label className="primary-text" htmlFor="type_input">
                        Tipo
                      </label>
                      <select
                        className="form-select"
                        id="type_input"
                        value={note_type}
                        onChange={(elem) => setNoteType(elem.target.value)}
                        required
                      >
                        <option value={"Circle"}>&#9679;</option>
                        <option value={"RightTriangle"}>&#9654;</option>
                        <option value={"LeftTriangle"}>&#9664;</option>
                      </select>
                    </div>

                    <div className="col-3 col-sm-1 mb-2 d-flex align-items-end justify-content-center">
                      <button type="submit" className="btn btn-warning">
                        <strong>+</strong>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
              <div className="table-responsive card">
                <table className="table table-bordered text-center">
                  <thead>
                    <tr>
                      <th className="primary-text" rowSpan={2}>
                        #
                      </th>
                      <th className="primary-text" rowSpan={2}>
                        Nome
                      </th>
                      <th className="primary-text" rowSpan={2}>
                        Nota
                      </th>
                      <th className="primary-text" colSpan={2}>
                        Violino
                      </th>
                      <th className="primary-text" colSpan={2}>
                        Viola
                      </th>
                      <th className="primary-text" rowSpan={2}>
                        Tipo
                      </th>
                      <th className="primary-text" rowSpan={2}></th>
                    </tr>
                    <tr>
                      <th className="primary-text" scope="col">
                        Corda
                      </th>
                      <th className="primary-text" scope="col">
                        Dedo
                      </th>
                      <th className="primary-text" scope="col">
                        Corda
                      </th>
                      <th className="primary-text" scope="col">
                        Dedo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes.map(function (note, index) {
                      return (
                        <tr key={index}>
                          <th className="primary-text" scope="row">
                            {index + 1}
                          </th>
                          <td className="primary-text">{note.name}</td>
                          <td className="primary-text">{note.note_code}</td>
                          <td className="primary-text">{note.violin_string}</td>
                          <td className="primary-text">{note.violin_finger}</td>
                          <td className="primary-text">{note.viola_string}</td>
                          <td className="primary-text">{note.viola_finger}</td>
                          <td className="primary-text">
                            {note_types[note.type]}
                          </td>
                          <td className="primary-text">
                            <FontAwesomeIcon
                              style={{ cursor: "pointer" }}
                              icon={faTrash}
                              onClick={() => removeNote(index)}
                            ></FontAwesomeIcon>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardDiv>
      </div>
      <div className="row g-3 my-2">
        <div className="col gap-3 d-flex justify-content-end">
          <button className="btn btn-success" onClick={editGameActivity}>
            Concluir
          </button>

          <Link href={`/contents/groups/edit/${activitygroup_id}`}>
            <button className="btn btn-danger">Cancelar</button>
          </Link>
        </div>
      </div>
    </>
  );
}
