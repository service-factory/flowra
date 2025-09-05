const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === "development") {
    return process.env.LOCAL_API_URL;
  }

  return process.env.PRODUCTION_API_URL;
};

export default getApiBaseUrl;
