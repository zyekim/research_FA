/** fetch wrapper with essential accessToken  */
import { useAuthStore } from "@/packages/auth/store/authStore";
import { baseUrl, AccessTokenKey } from "@/packages/utils/helper/constant";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * header 생성
 * @param hasFile
 * @returns
 */
const handleHeader = (hasFile: boolean) => {
  const authStore = useAuthStore();
  const accessToken =
    localStorage.getItem(AccessTokenKey) || authStore.accessToken || null;
  const headers = {
    ...(hasFile ? {} : { "Content-Type": "application/json" }),
    Authorization: `Bearer ${accessToken}`,
  };
  return headers;
};
let isHandling401 = false; // 401 처리 중인지 여부
async function handleRequest(
  method: Method,
  url: string,
  body?: any,
  fileYn?: "file" | null
) {
  const authStore = useAuthStore();
  const hasFile = fileYn == "file" ? true : false;
  let requestOptions: any = {
    method,
    headers: handleHeader(hasFile),
    body: hasFile ? body : JSON.stringify(body),
    credentials: "include",
  };

  let authApiRes = await fetch(baseUrl + url, requestOptions);
  let resData = null;
  /**
   * status 200 아닌 경우
   * > status : 401 token 만료 시 refresh token으로 token 다시 받아오기
   * > 그 외 : response 그대로 return
   * status 200인 경우
   * > response json형태로 return
   */
  const accessToken = localStorage.getItem(AccessTokenKey);

  if (authApiRes.status != 200) {
    if (authApiRes.status == 401) {
      if (!!accessToken) {
        if (isHandling401) {
          return;
        }
        isHandling401 = true;
        // refresh 재발급 시도
        const tokenResponse = await authStore.refreshToken();
        if (tokenResponse.result == "S") {
          isHandling401 = false;
          //재발급 성공 시 access token 담아서 기존 요청 다시 보내기
          requestOptions = {
            method,
            headers: handleHeader(hasFile),
          };
          authApiRes = await fetch(baseUrl + url, requestOptions);
          resData = await authApiRes.json();

          return resData;
        } else {
          await localStorage.removeItem(AccessTokenKey);
        }
      } else {
        confirm("세션이 만료되었습니다. 로그인 페이지로 이동합니다.");

        isHandling401 = false;
        // authStore.clearAuth();
        // authStore.logout();
        return;
      }
    } else return authApiRes;
  } else {
    resData = await authApiRes.json();
    return resData;
  }
}

function request(method: Method) {
  let result: any = null;

  return (url: any, body?: any, fileYn?: any) => {
    result = handleRequest(method, url, body, fileYn);

    return result;
  };
}

/**
 * 파일 다운로드 시 blob으로 오는 응답 처리하기 위해 json파싱하는 로직 삭제한 버전.
 * @param method HTTP 메서드
 * @param url 요청 URL
 * @param body 요청 body (optional)
 * @returns Response 객체
 */
async function getRaw(method: Method, url: string, body?: any) {
  const authStore = useAuthStore();
  const accessToken =
    localStorage.getItem(AccessTokenKey) || authStore.accessToken || null;

  let requestOptions: any = {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  };

  // body 필요한 method 체크
  if (body && (method == "POST" || method == "PUT" || method == "PATCH")) {
    requestOptions.body = JSON.stringify(body);
  }

  let response = await fetch(baseUrl + url, requestOptions);

  // 401 에러 처리
  if (response.status == 401) {
    if (!!accessToken) {
      if (isHandling401) {
        return response;
      }
      isHandling401 = true;

      const tokenResponse = await authStore.refreshToken();
      if (tokenResponse.result == "S") {
        isHandling401 = false;
        // 재발급 성공 시 다시 요청
        requestOptions.headers.Authorization = `Bearer ${
          localStorage.getItem(AccessTokenKey) || authStore.accessToken
        }`;
        response = await fetch(baseUrl + url, requestOptions);
      } else {
        await localStorage.removeItem(AccessTokenKey);
        isHandling401 = false;
        confirm("세션이 만료되었습니다. 로그인 페이지로 이동합니다.");
        // authStore.clearAuth();
        // authStore.logout();
      }
    } else {
      confirm("세션이 만료되었습니다. 로그인 페이지로 이동합니다.");
      // authStore.clearAuth();
      // authStore.logout();
    }
  }

  return response;
}

/**
 * 파일 다운로드 helper url 생성
 * @param method HTTP 메서드
 * @param url 요청 URL
 * @param body 요청 body (optional)
 * @returns { blob, FileName, response } 또는 null
 */

async function downloadFile(method: Method, url: string, body?: any) {
  // 1. json 파싱 아닌 그대로 return 하는 getRaw 호출
  const response = await getRaw(method, url, body);
  // 2. 결과 분기
  if (response.status == 200) {
    const blob = await response.blob();
    let fileName = "";
    // 파일명 추출
    const contentDisposition = response.headers.get("Content-Disposition");

    if (contentDisposition) {
      // 1. UTF-8 인코딩된 파일명 처리
      const utf8FilenameMatch = contentDisposition.match(
        /filename\*=UTF-8''([^;]+)/i
      );
      if (utf8FilenameMatch) {
        fileName = decodeURIComponent(utf8FilenameMatch[1]).normalize("NFC"); //  한글 깨짐 방지
      } else {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (filenameMatch && filenameMatch[1]) {
          fileName = filenameMatch[1].replace(/['"]/g, "");
          try {
            fileName = decodeURIComponent(fileName).normalize("NFC"); //  한글 깨짐 방지
          } catch (e) {
            // 디코딩 실패 시
          }
        }
      }
    }
    return { blob, fileName, response };
  }
  return null;
}

export const authFetchWrapper = {
  get: request("GET"),
  post: request("POST"),
  put: request("PUT"),
  delete: request("DELETE"),
  downloadFile, // download file helper
  getRaw, // json parse X
};
