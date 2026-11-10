const dns = require("dns").promises;
const net = require("net");
const { AppError } = require("../utils/errors");

// IPv4 ranges that are not globally routable (private, loopback, link-local,
// shared, documentation, benchmarking, multicast, and reserved space).
const BLOCKED_V4 = [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24],
  ["192.0.2.0", 24], ["192.88.99.0", 24], ["192.168.0.0", 16],
  ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24],
  ["224.0.0.0", 4], ["240.0.0.0", 4]
];

function ipv4Number(ip) {
  return ip.split(".").reduce((n, part) => ((n * 256) + Number(part)) >>> 0, 0);
}
function isPrivateIPv4(ip) {
  const value = ipv4Number(ip);
  return BLOCKED_V4.some(([baseIp, bits]) => {
    const mask = (0xffffffff << (32 - bits)) >>> 0;
    return (value & mask) === (ipv4Number(baseIp) & mask);
  });
}
function isPrivateIPv6(ip) {
  const x = ip.toLowerCase();
  // Conservatively reject IPv4-mapped IPv6 addresses. Providers should not
  // connect to mapped addresses; this avoids alternate encodings of IPv4.
  if (x.startsWith("::ffff:")) return true;
  if (x === "::" || x === "::1") return true;
  if (/^f[cd]/.test(x) || /^fe[89ab]/.test(x) || x.startsWith("ff")) return true;
  // Documentation-only IPv6 range 2001:db8::/32.
  if (/^2001:0*db8:/i.test(x)) return true;
  return false;
}
function isBlockedIp(ip) {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip);
  if (net.isIPv6(ip)) return isPrivateIPv6(ip);
  return true;
}

/**
 * Call before every provider outbound request. Reject the hostname if ANY DNS
 * answer is non-public. The provider must connect to one of these validated IPs
 * (pin DNS) and validate every redirect target again to prevent DNS rebinding.
 */
async function assertPublicHost(hostname) {
  let records;
  try { records = await dns.lookup(hostname, { all: true, verbatim: true }); }
  catch { throw new AppError(400, "URL_DNS_FAILED", "Hostname tidak dapat diverifikasi.", "invalid_url"); }
  if (!records.length || records.some(r => isBlockedIp(r.address)))
    throw new AppError(400, "URL_HOST_BLOCKED", "Hostname ini tidak diizinkan.", "invalid_url");
  return records.map(r => r.address);
}

module.exports = { isBlockedIp, assertPublicHost };
