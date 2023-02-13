import { ErrorMessage, Field, Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { login } from "../../redux/features/auth";
import { AppDispatch } from "../../redux/store";
import { ButtonPrimaryDarker } from "../../utils/buttons";

export default function LoginForm() {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loginInitialValues = {
    email: "",
    password: "",
  };

  const loginValidationSchema = Yup.object().shape({
    email: Yup.string().required("Este campo é necessário!"),
    password: Yup.string().required("Este campo é necessário!"),
  });

  const handleLogin = (formValue: { email: string; password: string }) => {
    const { email, password } = formValue;
    setLoading(true);

    dispatch(login({ email, password }))
      .unwrap()
      .then(() => {
        router.push("/");
      })
      .catch(() => {
        setLoading(false);
      });
  };

  return (
    <Formik
      initialValues={loginInitialValues}
      validationSchema={loginValidationSchema}
      onSubmit={handleLogin}
    >
      {({ errors, touched }) => (
        <Form>
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
          <div className="form-group mb-4">
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

          <div className="form-group">
            <ButtonPrimaryDarker
              type="submit"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading && (
                <span className="spinner-border spinner-border-sm"></span>
              )}
              Iniciar sessão
            </ButtonPrimaryDarker>
          </div>
        </Form>
      )}
    </Formik>
  );
}
