const { createApp } = require("./app");
const config = require("./config");

createApp().listen(config.port, () => console.log(`DOWNORA backend berjalan di port ${config.port} (${config.env})`));
