import app from './app.js';
import { initializeDatabase } from './db.js';
import { registerHeatScoreCron } from './cron/heatScore.js';
import { registerAutoArchiveCron } from './cron/autoArchive.js';

const PORT = process.env.PORT || 3000;

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      registerHeatScoreCron();
      registerAutoArchiveCron();
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
