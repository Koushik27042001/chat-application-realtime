/**
 * Optional fix for Node `querySrv ECONNREFUSED` on Windows when the system's
 * preferred DNS rejects SRV lookups (mongoose/mongodb-driver use Node's dns).
 * Set MONGO_DNS_SERVERS=8.8.8.8,1.1.1.1 in .env for local dev if needed.
 * Render/other hosts rarely need this; leave unset in production unless required.
 */
function applyMongoDnsFromEnv() {
  const raw = process.env.MONGO_DNS_SERVERS?.trim();
  if (!raw) return;
  const servers = raw.split(/[\s,]+/).filter(Boolean);
  if (servers.length === 0) return;
  require("dns").setServers(servers);
}

module.exports = { applyMongoDnsFromEnv };
