import Swal, { type SweetAlertResult, type SweetAlertIcon } from "sweetalert2";
import "./customSwal.scss";

const customIcon = {
  success: `
<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="9" y="9" width="62" height="62" rx="31" fill="#03C76B"/>
<path d="M54.5886 39.9997C54.5886 31.9428 48.0572 25.4114 40.0003 25.4114C31.9435 25.4114 25.4121 31.9428 25.4121 39.9997C25.4121 48.0565 31.9435 54.5879 40.0003 54.5879C48.0572 54.5879 54.5886 48.0565 54.5886 39.9997Z" stroke="white" stroke-width="2"/>
<path d="M34.165 41.0954C34.165 41.0954 36.4992 42.4266 37.6662 44.3778C37.6662 44.3778 41.1674 36.719 45.8356 34.166" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
  warning: `<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="9" width="62" height="62" rx="31" fill="#8E92C2"/>
    <circle cx="40.0003" cy="40.0003" r="14.5882" stroke="white" stroke-width="2"/>
    <path d="M39.988 43.9209H40.0011" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M40 39.5439L40 33.7087" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  `,
  error: `<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="9" width="62" height="62" rx="31" fill="#E95D77"/>
    <path d="M44.3751 44.376L35.623 35.623M35.624 44.376L44.376 35.623" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M54.5886 39.9997C54.5886 31.9428 48.0572 25.4114 40.0003 25.4114C31.9435 25.4114 25.4121 31.9428 25.4121 39.9997C25.4121 48.0565 31.9435 54.5879 40.0003 54.5879C48.0572 54.5879 54.5886 48.0565 54.5886 39.9997Z" stroke="white" stroke-width="2"/>
  </svg>
  `,
  info: ` <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="9" width="62" height="62" rx="31" fill="#1B2054"/>
    <path d="M54.5886 39.9997C54.5886 31.9428 48.0572 25.4114 40.0003 25.4114C31.9435 25.4114 25.4121 31.9428 25.4121 39.9997C25.4121 48.0565 31.9435 54.5879 40.0003 54.5879C48.0572 54.5879 54.5886 48.0565 54.5886 39.9997Z" stroke="white" stroke-width="2"/>
    <path d="M40.3534 47.294V39.9998C40.3534 39.3121 40.3534 38.9683 40.1397 38.7547C39.9261 38.541 39.5822 38.541 38.8945 38.541" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M39.988 34.1641H40.0011" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  `,
  question: `<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="9" width="62" height="62" rx="31" fill="#1B2054"/>
    <circle cx="40.0003" cy="40.0003" r="14.5882" stroke="white" stroke-width="2"/>
    <path d="M37.082 35.6237C37.082 34.0123 38.3883 32.7061 39.9997 32.7061C41.6111 32.7061 42.9173 34.0123 42.9173 35.6237C42.9173 36.2045 42.7476 36.7457 42.455 37.2004C41.5831 38.5555 39.9997 39.8476 39.9997 41.459V42.1884" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <path d="M39.988 46.8828H40.0011" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
};

// config 설정
const defaultConfig = {
  customClass: {
    popup: "rt-alert",
    confirmButton: "rt-alert__confirmBtn",
    cancelButton: "rt-alert__cancelBtn",
    title: "rt-alert__title",
    htmlContainer: "rt-alert__text",
    icon: "rt-alert__icon",
    actions: "rt-alert__actions",
    closeButton: "rt-alert__closeBtn"
  },
  allowOutsideClick: false,
  allowEscapeKey: false,
  reverseButtons: true,
  showCloseButton: true
};

// 콜백 함수 타입 정의
export type AlertCallback = () => void | Promise<void>;
export type ConfirmCallback = {
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
};

/**
 * 경고 알림
 * @param title 제목
 * @param message 메시지
 * @param callback 확인 버튼 클릭 시 실행할 콜백
 */

export const showWarning = async (
  title: string = "경고",
  message: string = "주의가 필요합니다.",
  icon: SweetAlertIcon = "warning",
  callback?: AlertCallback
): Promise<void> => {
  const result = await Swal.fire({
    ...defaultConfig,
    icon,
    iconHtml: customIcon[icon],
    title,
    html: message,
    confirmButtonText: "확인",
    customClass: {
      ...defaultConfig.customClass
    }
  });

  if (result.isConfirmed && callback) {
    await callback();
  }
};

/* 확인 알림 (취소 + 확인)
 * @param title 제목
 * @param message 메시지
 * @param callbacks 확인/취소 버튼 클릭 시 실행할 콜백들
 * @param confirmText 확인 버튼 텍스트
 * @param cancelText 취소 버튼 텍스트
 */
export const showConfirm = async (
  title?: string | undefined,
  message: string = "계속 진행하시겠습니까?",
  callbacks?: ConfirmCallback,
  icon: SweetAlertIcon = "question",
  confirmText: string = "확인",
  cancelText: string = "취소"
): Promise<boolean> => {
  const result = await Swal.fire({
    ...defaultConfig,
    icon,
    iconHtml: customIcon[icon],
    title,
    html: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    customClass: {
      ...defaultConfig.customClass
    }
  });

  if (result.isConfirmed) {
    if (callbacks?.onConfirm) {
      await callbacks.onConfirm();
    }
    return true;
  } else if (result.isDismissed) {
    if (callbacks?.onCancel) {
      await callbacks.onCancel();
    }
    return false;
  }

  return false;
};

/**
 * 실패 알림
 * @param title 제목
 * @param message 메시지
 * @param callback 확인 버튼 클릭 시 실행할 콜백
 */
export const showError = async (
  title?: string | undefined,
  message: string,
  callback?: AlertCallback
): Promise<void> => {
  const result = await Swal.fire({
    ...defaultConfig,
    icon: "error",
    iconHtml: customIcon.error,
    title,
    html: message,
    confirmButtonText: "확인",
    customClass: {
      ...defaultConfig.customClass
    }
  });

  if (result.isConfirmed && callback) {
    await callback();
  }
};

/**
 * 성공 알림
 * @param title 제목
 * @param message 메시지
 * @param callback 확인 버튼 클릭 시 실행할 콜백
 * @param timer 시간: 자동닫힘
 */
export const showSuccess = async (
  message: string,
  title?: string | undefined,
  timer?: number,
  callback?: AlertCallback
): Promise<void> => {
  const result = await Swal.fire({
    ...defaultConfig,
    icon: "success",
    iconHtml: customIcon.success,
    title,
    html: message,
    confirmButtonText: "확인",
    timer,
    customClass: {
      ...defaultConfig.customClass
    }
  });

  if (result.isConfirmed && callback) {
    await callback();
  }
};
