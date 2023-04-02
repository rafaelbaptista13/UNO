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
    console.log("Aqui");
    console.log(process.env.NODE_ENV);
    const target = process.env.NODE_ENV === "production"
      ? "http://deti-viola.ua.pt/internal-api/"
      : "http://api:8080"

    console.log(target)
    proxy
      .once("proxyRes", resolve)
      .once("error", reject)
      .web(req, res, {
        changeOrigin: true,
        target: target,
      });
  });

export default proxy;
