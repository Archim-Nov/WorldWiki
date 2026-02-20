import en from "@/messages/en.json";
import zhCN from "@/messages/zh-CN.json";
import type { AppLocale } from "./routing";

const messagesByLocale = {
  en,
  "zh-CN": zhCN,
} as const;

export function getMessagesForLocale(locale: AppLocale) {
  return messagesByLocale[locale];
}
