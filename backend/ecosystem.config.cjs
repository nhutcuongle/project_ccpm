module.exports = {
  apps: [
    {
      name: "ccpm-backend",
      script: "./server.js",
      instances: "max", // Chạy tối đa số nhân CPU hiện có
      exec_mode: "cluster", // Chế độ chạy đa nhân (clustering)
      env: {
        NODE_ENV: "production",
      },
      watch: false, // Tắt watch trong môi trường thật để tránh restart liên tục
      max_memory_restart: "1G", // Restart nếu chiếm quá 1GB RAM
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm Z",
    },
  ],
};
