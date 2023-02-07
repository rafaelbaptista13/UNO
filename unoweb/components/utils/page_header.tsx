import styled from "styled-components";

const CardDiv = styled.div`
  position: relative;
`;

export default function PageHeader({
  header_text,
}: {
  header_text: string;
}) {
  return (
    <CardDiv className="p-3 bg-white shadow-sm rounded d-sm-flex justify-content-sm-between">
      <h3 className="primary-text fw-bold ms-3 text-center">{header_text}</h3>
    </CardDiv>
  );
}
