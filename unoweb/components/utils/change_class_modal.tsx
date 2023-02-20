import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { useDispatch, useSelector } from "react-redux";
import {
  ActiveClassState,
  setActiveClass,
} from "../../redux/features/active_class";
import { RootState } from "../../redux/store";
import ClassesService from "../../services/classes.service";

export type ClassesType = {
  id: number;
  name: string;
};

interface IConfirmActionModalProps {
  onHide(): void;
  show: boolean;
}

export default function ChangeClassModal({
  show,
  onHide,
}: IConfirmActionModalProps) {
  const active_class_state = useSelector<RootState, ActiveClassState>(
    (state) => state.active_class
  );
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState({
    id: active_class_state.id,
    name: active_class_state.name,
  });
  const router = useRouter();
  const dispatch = useDispatch();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass({
      id: parseInt(event.target.value),
      name: event.target.options[event.target.options.selectedIndex].innerText,
    });
  };

  const changeClass = () => {
    dispatch(setActiveClass({id: selectedClass.id, name: selectedClass.name}));
  };

  useEffect(() => {
    ClassesService.getClasses().then((classes_data) => {
      setClasses(classes_data);
    });
  }, []);

  return (
    <Modal
      onHide={onHide}
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Alterar turma
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="form-row">
          <label htmlFor="classes_input">
            Selecione a turma que pretende gerir:
          </label>
          <div className="form-group mt-2 col-sm-6 col-xl-6">
            <select
              className="form-select"
              id="classes_input"
              value={selectedClass.id}
              onChange={handleChange}
            >
              {classes.map(function (class_elem: ClassesType, index) {
                return (
                  <option key={class_elem.id} value={class_elem.id}>
                    {class_elem.name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-success" onClick={() => {changeClass(); onHide(); router.push("/");}}>
          Confirmar
        </button>
        <button className="btn btn-danger" onClick={onHide}>
          Cancelar
        </button>
      </Modal.Footer>
    </Modal>
  );
}
