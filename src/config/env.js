const path = require('path');
const dotenv = require('dotenv');

let loaded = false;

const loadEnv = () => {
  if (loaded) {
    return;
  }

  const envPath = path.resolve(process.cwd(), '.env');
  dotenv.config({ path: envPath });
  loaded = true;
};

module.exports = { loadEnv };
