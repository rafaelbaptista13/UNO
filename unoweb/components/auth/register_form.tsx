import { ErrorMessage, Field, Form, Formik } from "formik";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { register } from "../../redux/features/auth";
import { AppDispatch } from "../../redux/store";
import { ButtonPrimaryDarker } from "../../utils/buttons";

export default function RegisterForm({
  successful,
  setSuccessful,
}: {
  successful: boolean;
  setSuccessful: (val: boolean) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();

  const registerInitialValues = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  };

  const registerValidationSchema = Yup.object().shape({
    first_name: Yup.string()
      .test(
        "len",
        "O primeiro nome deve ter entre 2 e 20 caracteres.",
        (val) =>
          val !== undefined &&
          val.toString().length >= 2 &&
          val.toString().length <= 20
      )
      .required("Este campo é necessário!"),
    last_name: Yup.string()
      .test(
        "len",
        "O último nome deve ter entre 2 e 20 caracteres.",
        (val) =>
          val !== undefined &&
          val.toString().length >= 2 &&
          val.toString().length <= 20
      )
      .required("Este campo é necessário!"),
    email: Yup.string()
      .email("Isto não é um email válido.")
      .required("Este campo é necessário!"),
    password: Yup.string()
      .test(
        "len",
        "A palavra passe deve ter entre 6 e 40 caracteres.",
        (val) =>
          val !== undefined &&
          val.toString().length >= 6 &&
          val.toString().length <= 40
      )
      .required("Este campo é necessário!"),
    confirm_password: Yup.string()
      .test(
        "passwords-match",
        "As palavras passes devem ser iguais.",
        function (val) {
          return this.parent.password === val;
        }
      )
      .required("Este campo é necessário!"),
  });

  const handleRegister = (formValue: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => {
    const { first_name, last_name, email, password } = formValue;

    setSuccessful(false);

    dispatch(register({ first_name, last_name, email, password }))
      .unwrap()
      .then(() => {
        setSuccessful(true);
      })
      .catch(() => {
        setSuccessful(false);
      });
  };

  return (
    <Formik
      initialValues={registerInitialValues}
      validationSchema={registerValidationSchema}
      onSubmit={handleRegister}
    >
      {({ errors, touched }) => (
        <Form>
          {!successful && (
            <div>
              <div className="form-group mb-2">
                <label htmlFor="input_first_name">Primeiro nome</label>
                <Field
                  name="first_name"
                  type="text"
                  className={
                    "form-control" +
                    (errors.first_name && touched.first_name
                      ? " is-invalid"
                      : "")
                  }
                  id="input_first_name"
                  placeholder="Inserir o primeiro nome"
                />
                <ErrorMessage
                  name="first_name"
                  component="div"
                  className="invalid-feedback"
                />
              </div>
              <div className="form-group mb-2">
                <label htmlFor="input_last_name">Último nome</label>
                <Field
                  name="last_name"
                  type="text"
                  className={
                    "form-control" +
                    (errors.last_name && touched.last_name ? " is-invalid" : "")
                  }
                  id="input_last_name"
                  placeholder="Inserir o último nome"
                />
                <ErrorMessage
                  name="last_name"
                  component="div"
                  className="invalid-feedback"
                />
              </div>
              <div className="form-group mb-2">
                <label htmlFor="input_email">Email</label>
                <Field
                  name="email"
                  type="email"
                  className={
                    "form-control" +
                    (errors.email && touched.email ? " is-invalid" : "")
                  }
                  id="input_email"
                  placeholder="Inserir o endereço de email"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="invalid-feedback"
                />
              </div>
              <div className="form-group mb-2">
                <label htmlFor="input_password">Palavra passe</label>
                <Field
                  name="password"
                  type="password"
                  className={
                    "form-control" +
                    (errors.password && touched.password ? " is-invalid" : "")
                  }
                  id="input_password"
                  placeholder="Inserir a palavra passe"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="invalid-feedback"
                />
              </div>
              <div className="form-group mb-4">
                <label htmlFor="input_confirm_password">
                  Confirmar palavra passe
                </label>
                <Field
                  name="confirm_password"
                  type="password"
                  className={
                    "form-control" +
                    (errors.confirm_password && touched.confirm_password
                      ? " is-invalid"
                      : "")
                  }
                  id="input_confirm_password"
                  placeholder="Inserir a palavra passe"
                />
                <ErrorMessage
                  name="confirm_password"
                  component="div"
                  className="invalid-feedback"
                />
              </div>
              <div className="form-group">
                <ButtonPrimaryDarker type="submit" style={{ width: "100%" }}>
                  Criar conta
                </ButtonPrimaryDarker>
              </div>
            </div>
          )}
        </Form>
      )}
    </Formik>
  );
}
