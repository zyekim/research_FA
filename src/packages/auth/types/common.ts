type menuListObject = {
  parentCode: string;
  sortOrder: number;
  menuCode: string;
  icon: string;
  menuName: string;
  authType?: string;
  depth: number;
  status: string;
  menuPath?: string;
  menuAvatar?: string;
  menuDescription?: string;
  menuHeaderMenu?: string;
  urlPath?: string;
  children?: menuListObject[];
};

type userProfile = {
  useTermStatus1?: string;
  useTermStatus2?: string;
  useTermStatus3?: string;
  [key: string]: any;
};

type storeInfo = {
  storeCode: string;
  [key: string]: any;
};

// type authType = {
//   user: userProfile | null;
//   currStore?: storeInfo | null;
//   returnUrl?: string | null;
//   accessToken?: string | null;
//   refreshToken?: string | null;
//   userInfo: string | null;
//   userMenuList: menuListObject[];
//   isLoggingOut: boolean;
//   selectedStore: string[];
//   defaultRoutes: {
//     path: string | null;
//     component: () => {};
//     redirect?: string | null;
//     children: any[];
//   };
//   nonAccessibleMenu: boolean;
//   authList: { key: string; label: string }[];
// };
interface authType {
  user: string | null;
  returnUrl: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  userInfo: string | null;
  userMenuList: any[];
  authList: { key: string; label: string }[];
}

interface userMenuAccessListType {
  menuCode: string;
  menuName: string;
  depth: number;
  parentMenuCode: string;
  sortOrder: number;
  visible?: string;
  view: string;
  tokenCheck?: string;
  accessCheck?: string;
  auth: string;
  status: string;
  description: string;
  children: userMenuAccessListType[];
  showChildren?: boolean;
  createUserId: string;
  createUserCode: string;
  createDate: string;
  updateUserId: string;
  updateUserCode: string;
  updateDate: string;
}

export type { authType, menuListObject, userMenuAccessListType };
