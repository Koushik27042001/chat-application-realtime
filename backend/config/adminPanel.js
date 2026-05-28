/**
 * Hardcoded admin panel credentials (requested). Access only via URL path
 * that matches ADMIN_PANEL_SECRET - see frontend `config/adminPanel.js`.
 * Security: treat this as a shared secret; change values if the repo is public.
 */
module.exports = {
  ADMIN_PANEL_SECRET: process.env.ADMIN_PANEL_SECRET || "admin_koushik",
  HARDCODED_ADMIN_USERNAME:
    process.env.ADMIN_LOGIN_USER_ID || process.env.ADMIN_USERNAME || "admin_koushik",
  HARDCODED_ADMIN_PASSWORD:
    process.env.ADMIN_LOGIN_PASSWORD || process.env.ADMIN_PASSWORD || "admin@123",
  HARDCODED_ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin_koushik@admin.local",
  HARDCODED_ADMIN_NAME: process.env.ADMIN_NAME || "Admin Koushik",
};
