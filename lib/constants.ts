export const TITLE = "Readup.ink";
export const READUP_HOST_URL = new URL(Deno.env.get("READUP_HOST")!);
export const READUP_HOST = READUP_HOST_URL.origin;
export const READUP_API_BASE =
  `${READUP_HOST_URL.protocol}//api.${READUP_HOST_URL.host}`;
