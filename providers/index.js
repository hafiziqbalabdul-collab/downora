/** Registry provider. Sengaja kosong: belum ada integrasi platform yang aktif.
 *  Tambah provider: const { register } = require("./providers"); register(new YoutubeProvider());
 */
const providers = [];

const register = p => { providers.push(p); return p; };
const unregister = p => { const i = providers.indexOf(p); if (i >= 0) providers.splice(i, 1); };
const findProvider = platformId => providers.find(p => p.supports(platformId)) || null;

module.exports = { register, unregister, findProvider };
