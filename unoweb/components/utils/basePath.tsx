const basePath = process.env.NODE_ENV === "production" ? "/rb-md-violuno-app-v1" : "";

export default function getBasePath() {
  return basePath;
}