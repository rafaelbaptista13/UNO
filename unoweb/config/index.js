const dev = process.env.NODE_END !== "production";

export const web_server = dev
  ? "http://localhost:3000"
  : "https://deti-viola.ua.pt/rb-md-violuno-app-v1";
export const api_server = dev
  ? "http://localhost:8080/api"
  : "https://deti-viola.ua.pt/rb-md-violuno-app-v1/internal-api";
