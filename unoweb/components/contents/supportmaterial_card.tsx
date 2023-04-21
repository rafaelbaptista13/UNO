import styled from "styled-components";

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// import the icons you need
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

import Link from "next/link";

const CardDiv = styled.div`
  position: relative;
`;

const CardLink = styled(Link)`
  text-decoration: none;
`;

export default function SupportMaterialCard({
  id,
  name,
  order,
  setConfirmAction,
}: {
  id: number;
  name: string;
  order: number;
  setConfirmAction: ({
    material_id,
    order,
  }: {
    material_id: number;
    order: number;
  }) => void;
}) {
  return (
    <CardDiv className="p-3 bg-white shadow-sm rounded d-sm-flex justify-content-sm-between">
      <div className="d-flex align-items-center justify-content-center justify-content-sm-between">
        <span className="primary-text">{order + "."}</span>
        <h3 className="primary-text ms-3 text-center mb-0">{name}</h3>
      </div>
      <div className="d-flex justify-content-center d-grid gap-3 mt-2 mt-sm-0">
        <CardLink href={"/contents/supportmaterials/" + id}>
          <button className="btn btn-warning">{"Ver material"}</button>
        </CardLink>
        <CardLink href={"/contents/supportmaterials/edit/" + id}>
          <button className="btn btn-secondary">
            <FontAwesomeIcon icon={faEdit}></FontAwesomeIcon> Editar
          </button>
        </CardLink>
        <div>
          <button
            className="btn btn-danger"
            onClick={() =>
              setConfirmAction({ material_id: id, order: order })
            }
          >
            <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon> Apagar
          </button>
        </div>
      </div>
    </CardDiv>
  );
}
