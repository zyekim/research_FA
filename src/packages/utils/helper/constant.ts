const baseUrl = `${import.meta.env.VITE_API_URL}`;
const AccessTokenKey = "JL-Orbit-AccessToken";
const RefreshTokenKey = "JL-Orbit-RefreshToken";
const imgBaseUrl = "https://jupiterlabs-dev.s3.ap-northeast-2.amazonaws.com/";
const homepageUrl = "https://www.jupiterlabs.co.kr/";

const languageList = [
  { lang: "en", avatar: "/assets/images/flag/icon-flag-en2.svg" },
  { lang: "kr", avatar: "/assets/images/flag/icon-flag-kr.svg" },
  { lang: "zh", avatar: "/assets/images/flag/icon-flag-zh.svg" },
  { lang: "fr", avatar: "/assets/images/flag/icon-flag-fr.svg" },
  { lang: "ro", avatar: "/assets/images/flag/icon-flag-ro.svg" },
];

const uploadFileUrlList = [
  { type: "bp", url: "/bp/image" },
  { type: "item", url: "/item/image" },
];

export {
  baseUrl,
  AccessTokenKey,
  RefreshTokenKey,
  imgBaseUrl,
  languageList,
  homepageUrl,
  uploadFileUrlList,
};
