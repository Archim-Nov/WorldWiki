import { headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isValidLocale } from "./routing";
import { getMessagesForLocale } from "./messages";

export default getRequestConfig(async () => {
  const requestHeaders = await headers();
  const requestedLocale = requestHeaders.get("x-worldwiki-locale");
  const locale = isValidLocale(requestedLocale) ? requestedLocale : defaultLocale;

  return {
    locale,
    messages: getMessagesForLocale(locale),
  };
});
