import axiosInstance from "./api";

const setup = (store) => {
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

            dispatch(refreshtoken());
            
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

            console.log("aquiiii");
            //console.log(rs.headers);

            return axiosInstance(originalConfig);
          } catch (_error) {
            console.log("dei erroaaa");
            console.log(_error.message);
            return Promise.reject(_error);
          }
        }
      }

      return Promise.reject(err);
    }
  );
};

export default setup;
