var express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');

/** Import routes */
const userRoutes = require('../routes/user');

const app = express();
app.use(bodyParser.json());

/** Import Controllers.**/
router.group('/api/v1', function (router) {

  router.get('/config', (req,res) => {
    return res.status(200).json(req.t('config_api'));
  });

  router.use('/user', userRoutes);

});

module.exports = router;