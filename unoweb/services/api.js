import axios from "axios";
import { store } from "../redux/store";
import { refreshToken } from "../redux/features/auth";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use({}, (error) => {
  console.log("oioioi");
  return Promise.reject(error);
});

const { dispatch } = store;
axiosInstance.interceptors.response.use(
  (res) => {
    console.log("oi?");

    console.log(res.headers);
    return res;
  },
  async (err) => {
    const originalConfig = err.config;
    if (originalConfig.url !== "/auth/signin" && err.response) {
      console.log("Comecei");
      console.log(err.response.status);
      console.log(originalConfig.headers);
      // Access Token was expired
      if (err.response.status === 401 && !originalConfig._retry) {
        console.log("entrei aqui");
        originalConfig._retry = true;
        try {
          console.log(originalConfig.headers.Cookie);

          await dispatch(refreshToken());

          /*const rs = await axiosInstance.post(
              "http://localhost:3000/api/auth/refreshtoken",
              {},
              {
                headers: {
                  Cookie: originalConfig.headers.Cookie,
                },
                withCredentials: true,
              }
            );*/

          console.log("Acabei com sucesso");
          //console.log(rs.headers);

          return axiosInstance(originalConfig);
        } catch (_error) {
          console.log("dei erro :(");
          console.log(_error.message);
          return Promise.reject(_error);
        }
      }
    }

    return Promise.reject(err);
  }
);

export default axiosInstance;
