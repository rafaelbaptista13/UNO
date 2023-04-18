import Head from "next/head";
import styled from "styled-components";
import Image from "next/image";
import { ButtonPrimaryInverseDarker } from "../utils/buttons";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { clearMessage, MessageState } from "../redux/features/message";
import LoginForm from "../components/auth/login_form";
import RegisterForm from "../components/auth/register_form";
import getBasePath from "../components/utils/basePath";

const ImageResponsiveDiv = styled.div`
  height: 200px;
  position: relative;
`;

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const [type, setType] = useState("login");
  const basePath = getBasePath();
  console.log(basePath);

  const [successful, setSuccessful] = useState(false);
  const { message } = useSelector<RootState, MessageState>(
    (state) => state.message
  );

  useEffect(() => {
    dispatch(clearMessage({}));
  }, [dispatch, type]);

  return (
    <>
      <Head>
        <title>UNO - Iniciar sessão</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container px-4 my-5">
        <div className="row mt-5 mb-5">
          <ImageResponsiveDiv>
            <Image
              fill
              sizes="100"
              id="header-logo"
              src={basePath + "/img/logo-vertical-no-background.png"}
              alt="SportsStats logo"
              style={{ objectFit: "contain" }}
            />
          </ImageResponsiveDiv>
        </div>
        <div className="row">
          <div className="col-md-2 col-lg-3"></div>
          <div className="col-md-8 col-lg-6">
            {type === "login" && <LoginForm />}
            {type === "register" && (
              <RegisterForm
                setSuccessful={setSuccessful}
                successful={successful}
              />
            )}

            {message && (
              <div className="form-group mt-2">
                <div
                  className={
                    successful ? "alert alert-success" : "alert alert-danger"
                  }
                  role="alert"
                >
                  {message}
                </div>
              </div>
            )}

            <div className="col text-center">
              <hr />
              {type === "login" && (
                <>
                  <span className="text-center primary-text">
                    Ainda não tem conta?
                  </span>
                  <ButtonPrimaryInverseDarker
                    style={{ width: "100%" }}
                    onClick={() => {
                      setType("register");
                    }}
                  >
                    Criar conta
                  </ButtonPrimaryInverseDarker>
                </>
              )}
              {type === "register" && (
                <>
                  <span className="text-center primary-text">
                    Já tem uma conta?
                  </span>
                  <ButtonPrimaryInverseDarker
                    style={{ width: "100%" }}
                    onClick={() => {
                      setType("login");
                    }}
                  >
                    Iniciar sessão
                  </ButtonPrimaryInverseDarker>
                </>
              )}
            </div>
          </div>
          <div className="col-md-2 col-lg-3"></div>
        </div>
      </div>
    </>
  );
}
