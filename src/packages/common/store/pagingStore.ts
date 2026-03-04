export interface pagingType {
  pagingList: number[];
  pageLim: number;
  pageNo: number;
  totalCount: number;
  totalPage: number;
}
export const usePagingStore = defineStore("paging", {
  state: (): pagingType => ({
    pagingList: [10, 15, 20, 30, 50, 100, 300, 500],
    pageLim: 30,
    pageNo: 1,
    totalCount: 0,
    totalPage: 0,
  }),
  getters: {},
  actions: {
    /**
     * getList 시 총 데이터 건수 업데이트
     * @param param
     */
    changeTotalCount(param: number) {
      this.totalCount = param;
    },
    /**
     * getList 시 총 페이지 수 업데이트
     * @param param
     */
    changeTotalPage(param: number) {
      this.totalPage = param;
    },
    /**
     * 한 페이지에 표시할 건수 변경
     * @param param
     */
    changePageLim(param: number) {
      this.pageLim = param;
    },

    changePageNo(param: number) {
      this.pageNo = param;
    },
  },
});
