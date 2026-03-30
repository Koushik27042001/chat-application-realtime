const REFRESH_COOKIE_NAME = "chat_refresh_token";

const getRefreshCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
};

const clearRefreshCookieOptions = () => ({
  ...getRefreshCookieOptions(),
  maxAge: 0,
  expires: new Date(0),
});

const readCookie = (req, cookieName = REFRESH_COOKIE_NAME) => {
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) {
    return "";
  }

  const cookies = cookieHeader.split(";");
  for (const entry of cookies) {
    const [rawName, ...rawValue] = entry.trim().split("=");
    if (rawName === cookieName) {
      return decodeURIComponent(rawValue.join("="));
    }
  }

  return "";
};

module.exports = {
  REFRESH_COOKIE_NAME,
  getRefreshCookieOptions,
  clearRefreshCookieOptions,
  readCookie,
};
