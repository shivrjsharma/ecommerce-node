// @ts-check

/** @type {import('pm2').StartOptions[]} */
const apps = [
  // ── Production ──────────────────────────────────────────────
  {
    name: "ecommerce-api",
    script: "./dist/app.js",
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "production",
    },
    env_file: ".env",
    out_file: "logs/pm2-out.log",
    error_file: "logs/pm2-error.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    max_memory_restart: "500M",
    restart_delay: 3000,
    autorestart: true,
    watch: ['dist'],
  },

  // ── Development ─────────────────────────────────────────────
  {
    name: "ecommerce-api-dev",
    script: "./src/app.ts",
    interpreter: "./node_modules/.bin/ts-node",
    interpreter_args: "--project tsconfig.json -r ts-node/register",
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "development",
    },
    env_file: ".env",
    out_file: "logs/pm2-out.log",
    error_file: "logs/pm2-error.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    watch: ["src"],
    watch_delay: 1000,
    ignore_watch: ["node_modules", "logs", "dist", "uploads"],
    autorestart: true,
  },
];

module.exports = { apps };
