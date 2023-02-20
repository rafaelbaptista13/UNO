import styled from "styled-components";

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// import the icons you need
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

import Link from "next/link";
import { useState } from "react";

const CardDiv = styled.div`
  position: relative;
`;

const CardLink = styled(Link)`
  text-decoration: none;
`;

export default function ClassCard({
  id,
  name,
  setConfirmActionClass,
  updateAction
}: {
  id: number;
  name: string;
  setConfirmActionClass: ({ id, name }: { id: number; name: string }) => void;
  updateAction: ({ id, name }: { id: number; name: string }) => void;
}) {
  const [view, setView] = useState("normal");
  const [editName, setEditName] = useState(name);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditName(event.target.value);
  };

  return (
    <CardDiv className="p-3 bg-white shadow-sm rounded d-sm-flex justify-content-sm-between">
      {view === "normal" && (
        <>
          <h3 className="primary-text ms-3 text-center">{name}</h3>
          <div className="d-flex justify-content-center d-grid gap-3">
            <CardLink href={"#"}>
              <button className="btn btn-warning">{"Ver alunos"}</button>
            </CardLink>
            <div>
              <button
                className="btn btn-secondary"
                onClick={() => setView("edit")}
              >
                <FontAwesomeIcon icon={faEdit}></FontAwesomeIcon> Editar
              </button>
            </div>
            <div>
              <button
                className="btn btn-danger"
                onClick={() => setConfirmActionClass({ id: id, name: name })}
              >
                <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon> Apagar
              </button>
            </div>
          </div>
        </>
      )}
      {view === "edit" && (
        <>
          <input
            type="text"
            className="form-control me-3"
            id="name_input"
            placeholder="Nome"
            value={editName}
            onChange={handleChange}
          />
          <div className="d-flex justify-content-center d-grid gap-3">
            <div>
              <button
                className="btn btn-success"
                onClick={() => {updateAction({ id: id, name: editName }); setView("normal");}}
              >
                Confirmar
              </button>
            </div>
            <div>
              <button
                className="btn btn-danger"
                onClick={() => {setEditName(name); setView("normal");}}
              >
                Cancelar
              </button>
            </div>
          </div>
        </>
      )}
    </CardDiv>
  );
}
