import {
  AccessTokenKey,
  RefreshTokenKey,
} from "@/packages/utils/helper/constant";
import router from "@/packages/router";

import type { authType } from "@/packages/auth/types/common";
import { fetchWrapper } from "@/packages/utils/api/fetch-wrapper";
import { authFetchWrapper } from "@/packages/utils/api/fetch-auth-wrapper";
import Cookies from "js-cookie";
import qs from "qs";
// const router = useRouter();

export const useAuthStore = defineStore("auth", {
  state: (): authType => ({
    // initialize state from local storage to enable user to stay logged in
    user: JSON.parse(localStorage.getItem("user")),
    returnUrl: null,
    accessToken: null,
    refreshToken: null,
    userInfo: JSON.parse(localStorage.getItem("userInfo")!),
    userMenuList: [],
    authList: [
      { key: "S", label: "시스템 관리자" },
      { key: "M", label: "관리자" },
      { key: "U", label: "사용자" },
      { key: "B", label: "셀러" },
      { key: "P", label: "공급처" },
      { key: "A", label: "API" },
    ],
  }),
  getters: {
    isAdmin() {
      let userAuth = JSON.parse(localStorage.getItem("userAuth")!);
      if (userAuth) {
        return userAuth.key == "S" ? true : false;
      }
    },
  },
  actions: {
    /**
     * 사용자 정보 조회
     * @returns
     */
    async getUserInfo() {
      const result = { result: "", message: "", data: {} };
      try {
        const responseData = await authFetchWrapper.get(`/user/info`);
        if (responseData.status != 200) {
          result.result = "E";
          result.message = responseData.message;
          return result;
        }
        result.result = "S";
        result.message = responseData.message;

        let userAuth = {};
        this.authList.forEach((element: any) => {
          if (element.key == responseData.data.authority) {
            userAuth = { key: element.key, label: element.label };
          }
        });

        localStorage.setItem(
          "userName",
          JSON.stringify(responseData.data.name)
        );
        localStorage.setItem("user", JSON.stringify(responseData.data.seq)); //스토리지에 저장하면 this.userSeq는 없어도 됨
        localStorage.setItem("userAuth", JSON.stringify(userAuth));
        localStorage.setItem(
          "groupCode",
          JSON.stringify(responseData.data.bp.groupCode)
        ); //231012_kh.an_메인 BP정보 추가
        const bpInfo = {
          bpName: responseData.data.bp.name,
          bpSeq: responseData.data.bp.seq,
          bpCode: responseData.data.bp.code,
          bpHsCode: responseData.data.bp.hscode, // [250117] hscode 추가
          bpHsCodeCategory: responseData.data.categoryName, // [250421] hscode category 추가
        };
        localStorage.setItem("bpInfo", JSON.stringify(bpInfo));
        /* 사용자 메뉴 리스트 가져오기 */
        // redirect to previous url or default to home page
        if (this.userMenuList) {
          const firstPage = await this.getFirstPage(
            responseData.data.bp.groupCode
          );
          router.push(this.returnUrl || firstPage!);
        } else {
          //권한 메뉴 리스트 없는 경우 우선 상품목록으로 연결
          router.push(this.returnUrl || "/main/product/list/item-spu");
        }
      } catch (error: Error | unknown) {
        result.result = "E";
        result.message = error instanceof Error ? error.message : "";
      }
      return result;
    },
    async login(id: string, passwd: string, rememberId: boolean) {
      /*변경 후 POST 방식*/
      const result = { result: "", message: "" };
      const loginRes = await fetchWrapper.post(`/user/login`, {
        id,
        passwd,
      });
      if (loginRes.status == 200) {
        result.result = "S";
        result.message = loginRes.message;

        // update pinia state
        sessionStorage.removeItem("tabs"); //session storage 삭제 -> 새로고침 -> 로그아웃 -> 로그인 시 vertical header tab에 boxed login이 추가되어서 로그인할 때 한번 더 초기화 작업 해줌.
        this.user = id;
        this.setAccessToken(loginRes.data.accessToken);
        this.setRefreshToken(loginRes.data.refreshToken);
        const infoRes = await this.getUserInfo();
        if (infoRes.result != "S") {
          result.result = "E";
          result.message = infoRes.message;
          return result;
        }
        localStorage.setItem("userEmail", JSON.stringify(id));
        // 아이디 저장 여부 체크
        if (rememberId) {
          Cookies.set("userId", id);
        } else {
          Cookies.remove("userId");
        }
      } else {
        result.result = "E";
        result.message = loginRes.message;
      }
      return result;
    },

    /** 240125 hjmoon
     * groupcode별로 진입 첫 페이지 체크하기
     * @param groupCode
     * @returns
     */
    async getFirstPage(groupCode?: string) {
      let firstPage: string | undefined = "/ ";
      if (groupCode == "B")
        // firstPage = '/order/seller/order-info/origin-order-list';
        firstPage = "/order";
      else if (groupCode == "P" || groupCode == "Z")
        // firstPage = '/order/order-info/order-master';
        firstPage = "/order";
      // else if (groupCode == 'P' || groupCode == 'Z') firstPage = '/master/item/item-spu-list';
      // else firstPage = '/order/seller/order-info/origin-order-list';
      firstPage = "/order";

      return firstPage;
    },

    /**
     * 사용자별 메뉴 리스트 조회
     * @param userSeq
     * @returns
     */
    async getUserMenuList(userSeq: any) {
      const result = { result: "", message: "" };
      const model = {
        status: "Y",
      };
      const responseData = await authFetchWrapper.get(
        `/user/${userSeq}/menu-authority?${qs.stringify(model)}`
      );
      if (responseData.status == 200) {
        result.result = "S";
        this.userMenuList = responseData.data;
      } else {
        result.result = "E";
        result.message = responseData.message;
      }
      return result;
    },

    logout() {
      this.user = null;
      this.userMenuList = [];
      localStorage.removeItem("user");
      localStorage.removeItem("user");
      sessionStorage.removeItem("tabs");
      localStorage.removeItem("groupCode");
      localStorage.removeItem("bpInfo");
      localStorage.clear;
      this.removeAccessToken();
      this.removeRefreshToken();
      router.push("/order");
    },

    async refreshToken() {
      const responseData = authFetchWrapper.post(`/user/refresh-token`);
      return responseData;
    },

    getAccessToken() {
      // Cookies.get(AccessTokenKey);
      localStorage.getItem(AccessTokenKey);
    },

    setAccessToken(token: string) {
      // Cookies.set(AccessTokenKey, token);
      // return Cookies.set(AccessTokenKey, token, { expires: expiresIn })
      const maxAge = 1;
      // Cookies.set(AccessTokenKey, token);
      return localStorage.setItem(AccessTokenKey, token);
    },

    removeAccessToken() {
      localStorage.removeItem(AccessTokenKey);
    },

    getRefreshToken() {
      localStorage.getItem(RefreshTokenKey);
    },

    setRefreshToken(token: string) {
      // Cookies.set(RefreshTokenKey, token);
      const maxAge = 7;
      return localStorage.setItem(RefreshTokenKey, token);
    },

    removeRefreshToken() {
      localStorage.removeItem(RefreshTokenKey);
    },
  },
});
