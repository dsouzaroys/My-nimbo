const express = require('express');
const router = express.Router();
const auth = require("../middlewares/jwt");

/** Import controllers */
const AuthCntrl = require('../controllers/auth/auth.controller')
const ContestCntrl = require('../controllers/contest/contest.controller')
const JoinContestCntrl = require('../controllers/contest/joinContest.controller')
const WalletCntrl = require('../controllers/contest/wallet.controller')


router.post('/register', AuthCntrl.register);
router.post('/login', AuthCntrl.login);
router.get('/get-image', ContestCntrl.getImage);

router.group(auth, function (router) {
  router.group("/contest", function (router) {
    router.post("/create", ContestCntrl.createContest);
    router.get("/list", ContestCntrl.getAllContest);
    router.get("/byid/:id", ContestCntrl.getContestById);
    router.get("/my-contest", ContestCntrl.myContest);
    router.put("/update/:id", ContestCntrl.updateContest);
  });

  router.group("/join-contest", function (router) {
    router.post("/", JoinContestCntrl.joinContest);
    router.get("/list", JoinContestCntrl.listJoinedContest);
    router.post("/like-share", JoinContestCntrl.likeAndShare);
  });

  router.group("/wallet", function (router) {
    router.post("/add", WalletCntrl.addAmont);
    router.get("/list", WalletCntrl.list);
  });

})
module.exports = router
