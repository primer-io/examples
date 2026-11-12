import { app } from './app.js';
import { config } from './config.js';
import { startWorker } from './worker.js';

app.listen(config.port, config.host, () => {
  console.log(`Listening on http://${config.host}:${config.port}`);
});
startWorker();
