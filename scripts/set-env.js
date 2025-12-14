const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const escape = (value) => value?.replace(/'/g, "\\'") ?? "";

const requiredVars = ["API_URL"];

for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

const generateEnvFileContent = (isProd) => `
// This file is generated automatically
export const environment = {
  production: ${isProd},
  base_url: '${escape(process.env.API_URL)}',
  base_files_url: '',
  payment_api_key: '${escape(process.env.PAYMENT_API_KEY)}',
  payment_api_secret: '${escape(process.env.PAYMENT_API_SECRET)}',
  STREAM_API_KEY: '${escape(process.env.STREAM_API_KEY)}',
  STREAM_API_SECRET: '${escape(process.env.STREAM_API_SECRET)}'
};
`;

const envDir = path.resolve(__dirname, "../src/environments");
const devEnvPath = path.join(envDir, "environment.ts");
const prodEnvPath = path.join(envDir, "environment.prod.ts");

// Crée le dossier src/environments s’il n’existe pas
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

// Écrit ou crée les fichiers
fs.writeFileSync(devEnvPath, generateEnvFileContent(false));
fs.writeFileSync(prodEnvPath, generateEnvFileContent(true));

console.log("✅ Environment files generated:");
