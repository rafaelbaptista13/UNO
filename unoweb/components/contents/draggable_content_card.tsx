import styled from "styled-components";

const CardDiv = styled.div`
  position: relative;
`;

export default function DraggableContentCard({
  id,
  name,
  order,
}: {
  id: number;
  name: string;
  order: number;
}) {

  return (
    <CardDiv className="p-3 bg-white shadow-sm rounded d-sm-flex justify-content-sm-between">
      <div className="d-flex align-items-center">
        <span className="primary-text">{order + "."}</span>
        <h3 className="primary-text ms-3 text-center mb-0">{name}</h3>
      </div>
    </CardDiv>
  );
}
