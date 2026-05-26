const REFRESH_COOKIE_NAME = "chat_refresh_token";

/** Render may omit NODE_ENV; respect RENDER_EXTERNAL_URL so cross-site cookies work (Vercel → Render). */
const isDeployed =
  process.env.NODE_ENV === "production" ||
  !!(process.env.RENDER_EXTERNAL_URL || process.env.RENDER);

const getRefreshCookieOptions = () => {
  return {
    httpOnly: true,
    secure: isDeployed,
    sameSite: isDeployed ? "none" : "lax",
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
