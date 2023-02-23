import styled from "styled-components";

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// import the icons you need
import { faAdd, faEdit } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useState } from "react";

const CardDiv = styled.div`
  position: relative;
`;

export default function PageHeaderWithEditAndLinkCard({
  id,
  name,
  order,
  button_text,
  link_path,
  updateAction,
}: {
  id: number;
  name: string;
  order: number;
  button_text: string;
  link_path: string;
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
          <div className="d-flex align-items-center">
          <span className="primary-text">{order + "."}</span>
            <h3 className="primary-text fw-bold ms-3 text-center mb-0">
              {name + " - Editar"}
            </h3>
          </div>

          <div className="d-flex justify-content-center d-grid gap-3">
            <div>
              <button
                className="btn btn-secondary"
                onClick={() => setView("edit")}
              >
                <FontAwesomeIcon icon={faEdit}></FontAwesomeIcon> Editar nome
              </button>
            </div>
            <Link href={link_path}>
              <button className="btn btn-warning">
                <FontAwesomeIcon icon={faAdd}></FontAwesomeIcon> {button_text}
              </button>
            </Link>
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
                onClick={() => {
                  updateAction({ id: id, name: editName });
                  setView("normal");
                }}
              >
                Confirmar
              </button>
            </div>
            <div>
              <button
                className="btn btn-danger"
                onClick={() => {
                  setEditName(name);
                  setView("normal");
                }}
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
