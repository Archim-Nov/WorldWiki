import { locales, type AppLocale } from "./routing";

function normalizePath(path: string): string {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:|tel:|#)/.test(href);
}

export function hasLocalePrefix(path: string): boolean {
  const normalized = normalizePath(path);
  return locales.some(
    (locale) => normalized === `/${locale}` || normalized.startsWith(`/${locale}/`)
  );
}

export function stripLocalePrefix(path: string): string {
  const normalized = normalizePath(path);

  for (const locale of locales) {
    if (normalized === `/${locale}`) return "/";
    if (normalized.startsWith(`/${locale}/`)) {
      return normalized.slice(locale.length + 1);
    }
  }

  return normalized;
}

export function withLocalePrefix(path: string, locale: AppLocale | string): string {
  if (!path) return `/${locale}`;
  if (isExternalHref(path)) return path;
  if (hasLocalePrefix(path)) return normalizePath(path);

  const normalized = normalizePath(path);
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}
