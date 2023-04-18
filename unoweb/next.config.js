/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  basePath: process.env.NODE_ENV === "production" ? '/rb-md-violuno-app-v1' : "",
}

module.exports = nextConfig
