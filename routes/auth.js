const express = require('express');
const router = express();
const middleware = require('../middleware/verifySignUp');
const controller = require('../controllers/auth');

router.use(function(req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

router.post('/signup',
    [
        middleware.checkDuplicateUsernameOrEmail,
    ],
    controller.signup
);

router.post('/signin', controller.signin);

router.post('/google', controller.google);

router.post('/facebook', controller.facebook);

router.post('/github', controller.github);

module.exports = router;