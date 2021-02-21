let express = require('express');
let router = express();

router.get('/', (req, res) => {
  res.render('index', {
      title: 'АИПОСИЗИ 2',
  });
});

module.exports = router;