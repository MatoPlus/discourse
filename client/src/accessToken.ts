export const setAccessToken = (token: string) => {
  localStorage.setItem("atkn", token);
};

export const getAccessToken = () => {
  return localStorage.getItem("atkn");
};
