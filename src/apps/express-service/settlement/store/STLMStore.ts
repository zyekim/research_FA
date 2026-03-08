import moment from "moment";
import { usePagingStore } from "@/packages/common/store/pagingStore";
import qs from "qs";
import { authFetchWrapper } from "@/packages/utils/api/fetch-auth-wrapper";

const pagingStore = usePagingStore();
const { pagingList, pageNo, pageLim, totalPage } = storeToRefs(pagingStore);

import type {
  searchSTLMType,
  sumTableType,
} from "@/apps/express-service/settlement/types/common";

export const useSTLMStore = defineStore("STLMStore", {
  state: () => ({
    STLMList: [] as any[],
    checkedAll: false,
    checkedSTLMList: [],
    totalCounte: 0,
    pageSettings: {
      pageSizes: pagingList.value,
      currentPage: pageNo.value,
      pageSize: pageLim.value,
      totalPage: totalPage.value,
      totalRecordsCount: 0,
      pageCount: 10,
    },
    searchData: {
      dateType: "CD",
      dateFrom: "2024-03-01", // 12
      dateTo: "2026-03-04",
      stlmStatus: [],
      searchText: null,
      carrierCodes: [] as string[],
    },
    loadingList: false,
    isVerified: false,
    verifiedList: [],
    popupLineCheckedList: [],
    popupCheckedAll: false,
    sumTable: {} as sumTableType,
    excelList: {},
    sumAllList: {},
  }),
  getters: {
    isAdmin() {
      // const isAdmin = computed(() => {
      let userAuth = JSON.parse(localStorage.getItem("userAuth")!);
      if (userAuth) {
        return userAuth.key == "S" ? true : false;
      }
      // });
    },
  },
  actions: {
    resetSearch() {
      this.searchData = {
        dateType: "CD",
        dateFrom: moment().format("YYYY-MM-01"),
        dateTo: moment().format("YYYY-MM-DD"),
        stlmStatus: [],
        searchText: null,
        carrierCodes: [],
      };
      this.getList(1);
    },
    getSTLMHeaderColor(target: string) {
      let headerStatusColors: any = {
        W: "text-standby",
        TS: "text-green",
        CCS: "text-green",
        FS: "text-green",
        CP: "text-blue",
        CS: "text-green",
        C: "text-point",
      };
      return headerStatusColors[target] || "";
    },
    async getList(page?: number, size?: number, searchData?: searchSTLMType) {
      const currPage = page ?? this.pageSettings.currentPage;
      const currSize = size ?? this.pageSettings.pageSize;
      const currSearchData = searchData ?? this.searchData;
      this.loadingList = true;
      const result = { result: "", message: "" };
      this.checkedSTLMList = [];

      if (currSize != this.pageSettings.pageSize) {
        this.pageSettings.currentPage = 1;
      } else {
        this.pageSettings.currentPage = page;
      }

      let param = {
        page: currPage,
        size: currSize,
        ...currSearchData,
      };

      try {
        const responseData = await authFetchWrapper.get(
          `/settlements/summary?${qs.stringify(param, { arrayFormat: "repeat" })}`
        );
        this.sumAllList = {};
        if (responseData.status == 200) {
          result.result = "S";
          if (responseData.data) {
            this.loadingList = false;
            this.STLMList = responseData.data.content;
            pagingStore.changeTotalCount(responseData.data.totalElements);
            pagingStore.changeTotalPage(responseData.data.totalPages);
            this.pageSettings.totalPage = responseData.data.totalPages;
            this.pageSettings.totalRecordsCount =
              responseData.data.totalElements;
            this.STLMList.forEach((elem: any) => {
              elem.showModalNote = false;
              elem.showModalManage = false;

              elem.shippingRegDate = moment(elem.shippingRegDate).format(
                "YYYY-MM-DD"
              );
              elem.localShippingFee
                ? (elem.localShippingFee =
                    elem.localShippingFee.toLocaleString("ko-KR"))
                : elem.localShippingFee;
              elem.shippingFee
                ? (elem.shippingFee = elem.shippingFee.toLocaleString("ko-KR"))
                : elem.shippingFee;
              elem.extraFee
                ? (elem.extraFee = elem.extraFee.toLocaleString("ko-KR"))
                : elem.extraFee;
              elem.localExtraFee
                ? (elem.localExtraFee =
                    elem.localExtraFee.toLocaleString("ko-KR"))
                : elem.localExtraFee;
              elem.fuelSurcharge
                ? (elem.fuelSurcharge =
                    elem.fuelSurcharge.toLocaleString("ko-KR"))
                : elem.fuelSurcharge;
              elem.localFuelSurcharge
                ? (elem.localFuelSurcharge =
                    elem.localFuelSurcharge.toLocaleString("ko-KR"))
                : elem.localFuelSurcharge;
              elem.extraShippingFee
                ? (elem.extraShippingFee =
                    elem.extraShippingFee.toLocaleString("ko-KR"))
                : elem.extraShippingFee;
              elem.tax
                ? (elem.tax = elem.tax.toLocaleString("ko-KR"))
                : elem.tax;
              elem.inspectionFee
                ? (elem.inspectionFee =
                    elem.inspectionFee.toLocaleString("ko-KR"))
                : elem.inspectionFee;
              elem.localInspectionFee
                ? (elem.localInspectionFee =
                    elem.localInspectionFee.toLocaleString("ko-KR"))
                : elem.localInspectionFee;
              elem.extraTax
                ? (elem.extraTax = elem.extraTax.toLocaleString("ko-KR"))
                : elem.extraTax;
              elem.localExtraTax
                ? (elem.localExtraTax =
                    elem.localExtraTax.toLocaleString("ko-KR"))
                : elem.localExtraTax;
              elem.otherPrice
                ? (elem.otherPrice = elem.otherPrice.toLocaleString("ko-KR"))
                : elem.otherPrice;
              elem.totalAmount
                ? (elem.totalAmount = elem.totalAmount.toLocaleString("ko-KR"))
                : elem.totalAmount;
              elem.description5 = elem.description5
                ? elem.description5.join("/")
                : elem.description5;
              elem.totalDescription = [
                elem.description,
                elem.description1,
                elem.description2,
                elem.description3,
                elem.description4,
                elem.description5,
              ].filter((item) => item != null);
            });
            // 합계
            const defaultValues = {
              sumOfShippingFee: 0, // 운송비
              sumOfExtraFee: 0, // 추가비용
              sumOfFuelSurcharge: 0, // 유류할증료
              sumOfExtraShippingFee: 0, // 추가운송비
              sumOfTax: 0, // 관세
              sumOfInspectionFee: 0, // 검사비용
              sumOfExtraTax: 0, // 기타세액
              sumOfOtherPrice: 0, // 기타비용
              sumOfTotalAmount: 0, // 총 비용
            };
            this.sumAllList = Object.fromEntries(
              Object.entries(defaultValues).map(([key, defaultValue]) => [
                key,
                responseData.data[key]
                  ? responseData.data[key].toLocaleString("ko-KR")
                  : defaultValue,
              ])
            );
            // this.summary();  조회기간별 전체합계로 수정
          } else if (!responseData.data) {
            this.loadingList = false;
            this.STLMList = [];
          }
        } else {
          this.loadingList = false;
          result.result = "E";
          result.message = responseData.message;
        }
      } catch (err) {
        console.log(err);
        return err;
      }
      return result;
    },
    summary() {
      let shippingFee = 0;
      let extraFee = 0;
      let fuelSurcharge = 0;
      let extraShippingFee = 0;
      let tax = 0;
      let inspectionFee = 0;
      let extraTax = 0;
      let otherPrice = 0;
      let totalAmount = 0;

      this.STLMList.forEach((element: any) => {
        /** 운송비 합계 */
        let tempShippingFee = element.shippingFee;
        if (tempShippingFee != 0) {
          if (tempShippingFee.includes(",")) {
            tempShippingFee = parseInt(tempShippingFee.replace(/,/g, ""));
          } else {
            tempShippingFee = Number(tempShippingFee);
          }
        } else {
          tempShippingFee = 0;
        }
        if (tempShippingFee > 0) tempShippingFee = tempShippingFee;
        shippingFee = Number(shippingFee) + parseInt(tempShippingFee);

        /** 추가비용 합계 */
        let tempExtraFee = element.extraFee;
        if (tempExtraFee != 0) {
          if (tempExtraFee.includes(",")) {
            tempExtraFee = parseInt(tempExtraFee.replace(/,/g, ""));
          } else {
            tempExtraFee = Number(tempExtraFee);
          }
        } else {
          tempExtraFee = 0;
        }
        if (tempExtraFee > 0) tempExtraFee = tempExtraFee;
        extraFee = Number(extraFee) + parseInt(tempExtraFee);
        /** 유류할증료 합계 */
        let tempFuelSurcharge = element.fuelSurcharge;
        if (tempFuelSurcharge != 0) {
          if (tempFuelSurcharge.includes(",")) {
            tempFuelSurcharge = parseInt(tempFuelSurcharge.replace(/,/g, ""));
          } else {
            tempFuelSurcharge = Number(tempFuelSurcharge);
          }
        } else {
          tempFuelSurcharge = 0;
        }
        if (tempFuelSurcharge > 0) tempFuelSurcharge = tempFuelSurcharge;
        fuelSurcharge = Number(fuelSurcharge) + parseInt(tempFuelSurcharge);
        /** 추가운송비 합계 */
        let tempExtraShippingFee = element.extraShippingFee;
        if (tempExtraShippingFee != 0) {
          if (tempExtraShippingFee.includes(",")) {
            tempExtraShippingFee = parseInt(
              tempExtraShippingFee.replace(/,/g, "")
            );
          } else {
            tempExtraShippingFee = Number(tempExtraShippingFee);
          }
        } else {
          tempExtraShippingFee = 0;
        }
        if (tempExtraShippingFee > 0)
          tempExtraShippingFee = tempExtraShippingFee;
        extraShippingFee =
          Number(extraShippingFee) + parseInt(tempExtraShippingFee);
        /** 관세 합계 */
        let tempTax = element.tax;
        if (tempTax != 0) {
          if (tempTax.includes(",")) {
            tempTax = parseInt(tempTax.replace(/,/g, ""));
          } else {
            tempTax = Number(tempTax);
          }
        } else {
          tempTax = 0;
        }
        if (tempTax > 0) tempTax = tempTax;
        tax = Number(tax) + parseInt(tempTax);
        /** 검사비용 합계 */
        let tempInspectionFee = element.inspectionFee;
        if (tempInspectionFee != 0) {
          if (tempInspectionFee.includes(",")) {
            tempInspectionFee = parseInt(tempInspectionFee.replace(/,/g, ""));
          } else {
            tempInspectionFee = Number(tempInspectionFee);
          }
        } else {
          tempInspectionFee = 0;
        }
        if (tempInspectionFee > 0) tempInspectionFee = tempInspectionFee;
        inspectionFee = Number(inspectionFee) + parseInt(tempInspectionFee);

        /** 기타세액 합계 */
        let tempExtraTax = element.extraTax;
        if (tempExtraTax != 0) {
          tempExtraTax = parseInt(tempExtraTax.replace(/,/g, ""));
        } else {
          tempExtraTax = Number(tempExtraTax);
        }
        if (tempExtraTax > 0) tempExtraTax = tempExtraTax;
        extraTax = Number(extraTax) + parseInt(tempExtraTax);
        /** 기타세액 합계 */
        let tempOtherPrice = element.otherPrice;
        if (tempOtherPrice != 0) {
          if (tempOtherPrice.includes(",")) {
            tempOtherPrice = parseInt(tempOtherPrice.replace(/,/g, ""));
          } else {
            tempOtherPrice = Number(tempOtherPrice);
          }
        } else {
          tempOtherPrice = 0;
        }
        if (tempOtherPrice > 0) tempOtherPrice = tempOtherPrice;
        otherPrice = Number(otherPrice) + parseInt(tempOtherPrice);
        /** 총비용 합계 */
        let tempTotalAmount = element.totalAmount;
        if (tempTotalAmount != 0) {
          if (tempTotalAmount.includes(",")) {
            tempTotalAmount = parseInt(tempTotalAmount.replace(/,/g, ""));
          } else {
            tempTotalAmount = Number(tempTotalAmount);
          }
        } else {
          tempTotalAmount = 0;
        }
        if (tempTotalAmount > 0) tempTotalAmount = tempTotalAmount;
        totalAmount = Number(totalAmount) + parseInt(tempTotalAmount);
      });
      this.sumTable.shippingFee = shippingFee.toLocaleString("ko-KR");
      this.sumTable.extraFee = extraFee.toLocaleString("ko-KR");
      this.sumTable.fuelSurcharge = fuelSurcharge.toLocaleString("ko-KR");
      this.sumTable.extraShippingFee = extraShippingFee.toLocaleString("ko-KR");
      this.sumTable.tax = tax.toLocaleString("ko-KR");
      this.sumTable.inspectionFee = inspectionFee.toLocaleString("ko-KR");
      this.sumTable.extraTax = extraTax.toLocaleString("ko-KR");
      this.sumTable.otherPrice = otherPrice.toLocaleString("ko-KR");
      this.sumTable.totalAmount = totalAmount.toLocaleString("ko-KR");
      // console.log(this.sumTable);
    },
  },
});
