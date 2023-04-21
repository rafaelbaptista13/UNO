import styled from "styled-components";

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// import the icons you need
import { faAdd, faSort } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const CardDiv = styled.div`
  position: relative;
`;

export default function SupportMaterialHeader({
  confirm_action,
  view,
  set_order_view,
}: {
  confirm_action: () => void;
  view: string;
  set_order_view: (view: string) => void;
}) {
  return (
    <CardDiv className="p-3 bg-white shadow-sm rounded d-sm-flex justify-content-sm-between">
      <h3 className="primary-text fw-bold ms-3 text-center">Materiais de apoio</h3>
      {view === "normal" && (
        <div className="d-flex justify-content-center d-grid gap-3">
          <div>
          <button className="btn btn-secondary" onClick={() => {set_order_view("edit_order")}}>
            <FontAwesomeIcon icon={faSort}></FontAwesomeIcon> Alterar ordem
          </button>
          </div>
          <Link href={"/contents/supportmaterials/new"}>
            <button className="btn btn-warning">
              <FontAwesomeIcon icon={faAdd}></FontAwesomeIcon> Novo material
            </button>
          </Link>
        </div>
      )}
      {view === "edit_order" && (
        <div className="d-flex justify-content-center d-grid gap-3 mt-2 mt-sm-0">
          <div>
            <button
              className="btn btn-success"
              onClick={() => {
                confirm_action();
                set_order_view("normal");
              }}
            >
              Confirmar
            </button>
          </div>
          <div>
            <button
              className="btn btn-danger"
              onClick={() => {
                set_order_view("normal");
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </CardDiv>
  );
}
