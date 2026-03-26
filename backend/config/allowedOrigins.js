const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://chat-application-realtime-ruddy.vercel.app",
];

const parseOrigins = (...values) => {
  const origins = new Set(DEFAULT_ORIGINS);

  values
    .filter(Boolean)
    .forEach((value) => {
      String(value)
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
        .forEach((origin) => origins.add(origin));
    });

  return Array.from(origins);
};

module.exports = parseOrigins(
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL
);
