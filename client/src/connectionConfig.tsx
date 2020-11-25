const DEV_BASE_URL = "http://localhost:4000";
const PROD_BASE_URL = "https://sheltered-atoll-15915.herokuapp.com";

export const getBaseURL = () => {
  let baseURL: string;
  if (process.env.NODE_ENV === "production") {
    baseURL = PROD_BASE_URL;
  } else {
    baseURL = DEV_BASE_URL;
  }

  return baseURL;
};
