/** fetch wrapper not with accessToken */

import { baseUrl } from "@/packages/utils/helper/constant";

type method = "POST" | "GET" | "PUT" | "DELETE" | "PATCH";
async function handleRequest(
  method: method,
  url: string,
  body?: any,
  fileYn?: any
) {
  const requestOptions: any = {
    method,
    headers:
      fileYn == "file"
        ? {}
        : {
            "Content-Type": "application/json",
          },
    body: JSON.stringify(body),
    credentials: "include",
  };

  try {
    const apiResponse = await fetch(baseUrl + url, requestOptions);
    const data = await apiResponse.json();
    return data;
  } catch (_) {
    throw new Error("유효하지 않는 접근입니다.");
  }
}

const request = (method: method) => {
  let result: any = null;

  return (url: string, body?: any, fileYn?: any) => {
    result = handleRequest(method, url, body, fileYn);
    return result;
  };
};

export const fetchWrapper = {
  get: request("GET"),
  post: request("POST"),
  put: request("PUT"),
  delete: request("DELETE"),
};
