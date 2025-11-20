module.exports = {
  apps: [
    {
      name: "8003acshd-backend",
      script: "./server.js",
      cwd: "/home/pdmrindia/public_html/acshd.compu-ops.com/backend",
      env: {
        NODE_ENV: "development",
        FRONTEND_URL: "https://acshd.compu-ops.com",
        DB_HOST: "127.0.0.1",
        DB_USER: "pdmrindia_acs_hd_user",
        DB_PASS: "acs_hd@2025!",
        DB_NAME: "pdmrindia_acs_hd",
        PORT: 8003,
        EMAIL_USER: "prasanna@pdmrindia.com",
        EMAIL_PASS: "qzzd teyl pwfj pqvh",
        JWT_SECRET: "your_super_secret_jwt_key",
        JWT_EXPIRES_IN: "2h"
      }
    }
  ]
};
