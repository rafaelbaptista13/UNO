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

export default function ContentCard({
  id,
  name,
  order,
  setConfirmActionWeek,
}: {
  id: number;
  name: string;
  order: number;
  setConfirmActionWeek: ({
    activitygroup_id,
    order,
  }: {
    activitygroup_id: number;
    order: number;
  }) => void;
}) {
  return (
    <CardDiv className="p-3 bg-white shadow-sm rounded d-sm-flex justify-content-sm-between">
      <div className="d-flex align-items-center">
        <span className="primary-text">{order + "."}</span>
        <h3 className="primary-text ms-3 text-center mb-0">{name}</h3>
      </div>
      <div className="d-flex justify-content-center d-grid gap-3">
        <CardLink href={"#"}>
          <button className="btn btn-warning">{"Ver alunos"}</button>
        </CardLink>
        <CardLink href={"/contents/groups/edit/" + id}>
          <button className="btn btn-secondary">
            <FontAwesomeIcon icon={faEdit}></FontAwesomeIcon> Editar
          </button>
        </CardLink>
        <div>
          <button
            className="btn btn-danger"
            onClick={() =>
              setConfirmActionWeek({ activitygroup_id: id, order: order })
            }
          >
            <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon> Apagar
          </button>
        </div>
      </div>
    </CardDiv>
  );
}
