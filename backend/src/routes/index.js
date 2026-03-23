const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({ message: 'UrbanPulse API' });
});

module.exports = router;
