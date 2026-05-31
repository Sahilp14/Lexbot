const PC_WIFI_IP = "10.226.203.98";
const DEV_PORT = "8000";

export const getBaseUrl = () => {
  const hostname = window.location.hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `http://localhost:${DEV_PORT}`;
  }

  return `http://${PC_WIFI_IP}:${DEV_PORT}`;
};