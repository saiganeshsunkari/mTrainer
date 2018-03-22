var router = require('express').Router();
var winston = require('winston');

router.post('/', function (req, res) {
    // res.send('Got a get request');
    var data1 = req.body;
    var data = {
        "Data": "",
        "error": ""
    };
    var db = req.db;
    logger.info('Got a post request for authenticate');
    logger.info(data1.email);
    db.collection('passwords').findOne({
        _userEmail: data1.email
    }, function (err, items) {
        if (items.length != 0) {
            bcrypt.compare(data1.password, items.password).then(function (res) {
                data["error"] = 0;
                data["Data"] = items;
                logger.info("Passwords matched");
                // logger.info(res);
                // logger.info(data);
                sendResponse(data);
                logger.info(data1.email + "-" + res);
            });
            function sendResponse(data) {
                logger.info("=========data");
                logger.info(data);
                res.json(data);
            }

        } else {
            data["error"] = 1;
            data["Data"] = 'Username or Password is incorrect.';
            logger.warn(res);
            res.json(data);
        }
    });
});

module.exports = router;
