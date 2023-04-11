import styled from "styled-components";

import Link from "next/link";

const CardDiv = styled.div`
  position: relative;
`;

const CardLink = styled(Link)`
  text-decoration: none;
`;

export default function StudentContentCard({
  activitygroup_id,
  student_id,
  name,
  completed_activities,
  total_activities
}: {
  activitygroup_id: number;
  student_id: number;
  name: string;
  completed_activities: number;
  total_activities: number;
}) {
  return (
    <CardDiv className="p-3 bg-white shadow-sm rounded d-sm-flex justify-content-sm-between">
      <div className="d-flex align-items-center justify-content-center justify-content-sm-between">
        <h3 className="primary-text ms-3 text-center mb-0">{name}</h3>
      </div>
      <div className="d-flex align-items-center justify-content-center justify-content-sm-between">
        <h5 className="primary-text ms-3 text-center mb-0">{completed_activities + "/" + total_activities}</h5>
      </div>
      <div className="d-flex justify-content-center d-grid gap-3 mt-2 mt-sm-0">
        <CardLink href={"/contents/groups/" + activitygroup_id + "/students/" + student_id}>
          <button className="btn btn-warning">{"Ver aluno"}</button>
        </CardLink>
      </div>
    </CardDiv>
  );
}
