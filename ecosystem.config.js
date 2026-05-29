module.exports = {
  apps: [
    {
      name: "rentigo-server",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 5001,
      },
      watch: false,
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
