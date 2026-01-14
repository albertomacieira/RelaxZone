const app = require("./app");
const { loadEnv } = require("./config/env");
const { connectPool } = require("./db/pool");

loadEnv();

const PORT = Number(process.env.PORT || 4000);

async function start() {
  try {
    await connectPool();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Relax Zone server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();

