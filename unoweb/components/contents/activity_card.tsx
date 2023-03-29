import styled from "styled-components";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const CardDiv = styled.div`
  position: relative;
`;

const CardLink = styled(Link)`
  text-decoration: none;
`;

const ImageResponsiveDiv = styled.div`
  margin: auto;
  height: 40px;
  position: relative;
`;

const TableDiv = styled.div`
  display: table;
  height: 100%;
  width: 100%;
`;

const TableCell = styled.div`
  height: 100%;
  vertical-align: middle;
  display: table-cell;
  text-align: center;
`;

export default function ActivityCard({
  activitygroup_id,
  activity_id,
  num,
  title,
  type,
  description,
  setConfirmActionActivity,
}: {
  activitygroup_id: number;
  activity_id: number;
  num: number;
  title: string;
  type: string;
  description: string;
  setConfirmActionActivity: ({
    id,
    order,
  }: {
    id: number;
    order: number;
  }) => void;
}) {
  return (
    <CardDiv className="container p-3 bg-white shadow-sm rounded">
      <div className="row">
        <div className="col-1 d-flex align-items-center justify-content-center">
          <h5 className="text-center">{num + "."}</h5>
        </div>
        <div className="col-3 col-md-2 col-lg-1">
          <TableDiv>
            <TableCell>
              <ImageResponsiveDiv>
                <Image
                  fill
                  sizes="100"
                  className="activity_logo"
                  src={`/img/icons/${type}.png`}
                  alt={"activity logo"}
                  style={{ objectFit: "contain" }}
                />
              </ImageResponsiveDiv>
            </TableCell>
          </TableDiv>
        </div>
        <div className="col-8 col-md-5 col-lg-6">
          <span className="primary-text fw-bold">{title}</span>
          <br />
          <span className="primary-text">{description}</span>
        </div>
        <div className="col-md-4 d-flex align-items-center justify-content-center justify-content-md-end d-grid gap-3 mt-2 mt-md-0">
          <CardLink
            href={`/contents/groups/edit/${activitygroup_id}/activities/${activity_id}`}
          >
            <button className="btn btn-secondary">
              <FontAwesomeIcon icon={faEdit}></FontAwesomeIcon> Editar
            </button>
          </CardLink>
          <button
            className="btn btn-danger"
            onClick={() =>
              setConfirmActionActivity({
                id: activity_id,
                order: num,
              })
            }
          >
            <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon> Apagar
          </button>
        </div>
      </div>
    </CardDiv>
  );
}
