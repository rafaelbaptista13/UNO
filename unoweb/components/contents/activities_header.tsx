import styled from "styled-components";

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// import the icons you need
import { faAdd, faEdit, faSort } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useState } from "react";

const CardDiv = styled.div`
  position: relative;
`;

export default function ActivitiesHeader({
  id,
  name,
  order,
  activitygroup_id,
  update_action,
  view,
  set_view,
  change_order,
}: {
  id: number;
  name: string;
  order: number;
  activitygroup_id: number;
  update_action: ({ id, name }: { id: number; name: string }) => void;
  view: string;
  set_view: (view: string) => void;
  change_order: () => void;
}) {
  const [editName, setEditName] = useState(name);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditName(event.target.value);
  };

  return (
    <CardDiv className="p-3 bg-white shadow-sm rounded d-sm-flex justify-content-sm-between">
      {view === "normal" && (
        <>
          <div className="d-flex align-items-center justify-content-center justify-content-sm-between">
            <span className="primary-text">{order + "."}</span>
            <h3 className="primary-text fw-bold ms-3 text-center mb-0">
              {name + " - Editar"}
            </h3>
          </div>

          <div className="d-flex justify-content-center d-grid gap-3 mt-2 mt-sm-0">
            <div>
              <button
                className="btn btn-secondary"
                onClick={() => set_view("edit_name")}
              >
                <FontAwesomeIcon icon={faEdit}></FontAwesomeIcon> Editar nome
              </button>
            </div>
            <div>
              <button
                className="btn btn-secondary"
                onClick={() => set_view("edit_order")}
              >
                <FontAwesomeIcon icon={faSort}></FontAwesomeIcon> Alterar ordem
              </button>
            </div>
            <Link href={`/contents/groups/edit/${activitygroup_id}/activities/new`}>
              <button className="btn btn-warning">
                <FontAwesomeIcon icon={faAdd}></FontAwesomeIcon> Nova atividade
              </button>
            </Link>
          </div>
        </>
      )}

      {view === "edit_order" && (
        <>
          <div className="d-flex align-items-center justify-content-center justify-content-sm-between">
            <span className="primary-text">{order + "."}</span>
            <h3 className="primary-text fw-bold ms-3 text-center mb-0">
              {name + " - Editar"}
            </h3>
          </div>
          <div className="d-flex justify-content-center d-grid gap-3 mt-2 mt-sm-0">
            <div>
              <button
                className="btn btn-success"
                onClick={() => {
                  change_order();
                  set_view("normal");
                }}
              >
                Confirmar
              </button>
            </div>
            <div>
              <button
                className="btn btn-danger"
                onClick={() => {
                  set_view("normal");
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </>
      )}

      {view === "edit_name" && (
        <>
          <input
            type="text"
            className="form-control me-3"
            id="name_input"
            placeholder="Nome"
            value={editName}
            onChange={handleChange}
          />
          <div className="d-flex justify-content-center d-grid gap-3 mt-2 mt-sm-0">
            <div>
              <button
                className="btn btn-success"
                onClick={() => {
                  update_action({ id: id, name: editName });
                  set_view("normal");
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
                  set_view("normal");
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
