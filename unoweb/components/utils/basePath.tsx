import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();
const basePath = publicRuntimeConfig.basePath;

export default function getBasePath() {
  return basePath;
}