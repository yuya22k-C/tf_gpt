import { NextRequest } from "next/server";

const SECRET_HEADER = "x-app-secret";

export function getEditSecret() {
  return process.env.APP_EDIT_SECRET ?? "";
}

export function isMutationAuthorized(request: NextRequest) {
  const configuredSecret = getEditSecret();
  if (!configuredSecret) {
    return false;
  }

  return request.headers.get(SECRET_HEADER) === configuredSecret;
}

export function secretHeaderName() {
  return SECRET_HEADER;
}
