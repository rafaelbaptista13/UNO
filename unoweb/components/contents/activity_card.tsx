import styled from "styled-components";
import Image from "next/image";

const CardDiv = styled.div`
  position: relative;
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
  num,
  title,
  type,
  description,
}: {
  num: string;
  title: string;
  type: string;
  description: string;
}) {
  return (
    <CardDiv className="container p-3 bg-white shadow-sm rounded">
      <div className="row">
        <div className="col-1 d-flex align-items-center justify-content-center">
          <h5 className="text-center">{num}</h5>
        </div>
        <div className="col-3 col-md-2 col-lg-1">
          <TableDiv>
            <TableCell>
              <ImageResponsiveDiv>
                <Image
                  fill
                  sizes="100"
                  className="activity_logo"
                  src={"/img/icons/video.png"}
                  alt={"activity logo"}
                  style={{ objectFit: "contain" }}
                />
              </ImageResponsiveDiv>
            </TableCell>
          </TableDiv>
        </div>
        <div className="col-8 col-md-9 col-lg-10">
          <span className="primary-text fw-bold">{title}</span>
          <br />
          <span className="primary-text">{description}</span>
        </div>
      </div>
    </CardDiv>
  );
}
