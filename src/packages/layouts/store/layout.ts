export const useLayoutStore = defineStore("layout", {
  state: () => ({
    drawerRail: false as boolean,
  }),
  actions: {
    toggleDrawer(): void {
      this.drawerRail = !this.drawerRail;
    },
  },
});
