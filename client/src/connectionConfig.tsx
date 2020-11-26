const DEV_BASE_URL = "";
const PROD_BASE_URL = "";

export const getBaseURL = (): string => {
  let baseURL: string;
  if (process.env.NODE_ENV === "production") {
    baseURL = PROD_BASE_URL;
  } else {
    baseURL = DEV_BASE_URL;
  }

  return baseURL;
};
