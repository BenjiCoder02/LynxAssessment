const Hapi = require('@hapi/hapi');
const sequelize = require('./src/config/db');
const routes = require('./src/routes');
const rateLimitPlugin = require('hapi-rate-limit');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
  });

  //Register plugins
  await server.register({
    plugin: rateLimitPlugin,
  });

  // Register routes
  server.route(routes);

  // Start the server
  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

// Sync the database and start the server
sequelize.sync()
  .then(() => {
    init();
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });
