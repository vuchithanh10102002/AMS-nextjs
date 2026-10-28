module.exports = {
  apps: [
    {
      name: "ams-next",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3200",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: "800M",
      env: { NODE_ENV: "production" },
    },
  ],
};
