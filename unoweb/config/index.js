const dev = process.env.NODE_END !== "production";

export const web_server = dev
  ? "http://localhost:3000"
  : "https://deployment-web-server/";
export const api_server = dev
  ? "http://localhost:8080/api"
  : "https://deployment-api-server/";
