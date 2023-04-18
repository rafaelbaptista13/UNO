import { IncomingMessage, ServerResponse } from "http";
import httpProxy from "http-proxy";

export const config = {
  api: {
    // Enable `externalResolver` option in Next.js
    externalResolver: true,
    bodyParser: false,
    responseLimit: false,
  },
};

const proxy = (req: IncomingMessage, res: ServerResponse<IncomingMessage>) =>
  new Promise((resolve, reject) => {
    const proxy: httpProxy = httpProxy.createProxy();
    const target = process.env.NODE_ENV === "production"
      ? "https://deti-viola.ua.pt/rb-md-violuno-app-v1/internal-api"
      : "http://localhost:8080"

    console.log(target)
    proxy
      .once("proxyRes", resolve)
      .once("error", reject)
      .web(req, res, {
        changeOrigin: true,
        target: target,
        secure: false
      });
  });

export default proxy;
