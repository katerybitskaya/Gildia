module.exports = {
  apps: [
    {
      name: 'gildia',
      script: './serwer.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/gildia-error.log',
      out_file: './logs/gildia-out.log',
      time: true
    }
  ]
};
