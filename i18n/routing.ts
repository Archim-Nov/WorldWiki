export const locales = ["zh-CN", "en"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "zh-CN";
export const localeCookieName = "worldwiki-locale";

export function isValidLocale(value: string | null | undefined): value is AppLocale {
  return value === "zh-CN" || value === "en";
}
