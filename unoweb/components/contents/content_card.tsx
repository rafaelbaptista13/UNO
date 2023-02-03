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
  week_number,
  setConfirmActionWeek,
}: {
  id: number;
  week_number: number;
  setConfirmActionWeek: ({
    week_id,
    week_number,
  }: {
    week_id: number;
    week_number: number;
  }) => void;
}) {
  return (
    <CardDiv className="p-3 bg-white shadow-sm rounded d-sm-flex justify-content-sm-between">
      <h3 className="primary-text ms-3 text-center">
        {"Semana " + week_number}
      </h3>
      <div className="d-flex justify-content-center d-grid gap-3">
        <CardLink href={"#"}>
          <button className="btn btn-warning">{"Ver alunos"}</button>
        </CardLink>
        <CardLink href={"/contents/weeks/edit/" + id}>
          <button className="btn btn-secondary">
            <FontAwesomeIcon icon={faEdit}></FontAwesomeIcon> Editar
          </button>
        </CardLink>
        <div>
          <button
            className="btn btn-danger"
            onClick={() =>
              setConfirmActionWeek({ week_id: id, week_number: week_number })
            }
          >
            <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon> Apagar
          </button>
        </div>
      </div>
    </CardDiv>
  );
}
