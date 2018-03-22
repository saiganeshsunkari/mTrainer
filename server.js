var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var winston = require('winston');
var fs = require('fs');

var cors = require('cors')

var moment = require('moment');

var jwt = require('jsonwebtoken');

var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
 var assert = require('assert');
 //var url = 'mongodb://localhost:27017/mTrainer';
var mongo = require('mongoskin'); // Require mongoskin module

//Set seed mongo replicas.
var url = 'mongodb://192.168.1.181:27017,192.168.1.182:27017,192.168.1.183:27017/mTrainerDev?replicaSet=rs';

// Connect DB
var db = mongo.db(url, {
    native_parser: true,
    'auto_reconnect': true,
    'poolSize': 100,
    socketOptions: {
        keepAlive: 50,
        connectTimeoutMS: 1000,
        socketTimeoutMS: 0
    }
});

/* var db = mongo.db("mongodb://localhost:27017/mTrainerDev", {
    native_parser: true
}); */
var ObjectId = require('mongodb').ObjectID;
var unirest = require('unirest');
var bcrypt = require('bcryptjs');

var proxy = require('express-http-proxy');

var ExpressBrute = require('express-brute');

var store = new ExpressBrute.MemoryStore(); // stores state locally, don't use this in production
var bruteforce = new ExpressBrute(store, {
    freeRetries: 1000,
    minWait: 5 * 60 * 1000, // 5 minutes
    maxWait: 60 * 60 * 1000
});

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json()); // Body parser use JSON data
app.use(function(req, res, next) {
    req.db = db;
    res.header('Access-Control-Allow-Origin', '*'); // We can access from anywhere
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

app.use(cors())
app.use(bruteforce.prevent);

app.use('/mTrainer', proxy(process.env.RASA_URI, {
  userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
    data = JSON.parse(proxyResData.toString('utf8'));

	console.log(userReq);
	
	console.log(JSON.stringify(data));
    return JSON.stringify(data);
}}
));

//Function to generate JWT Token
function generateToken(username, callback) {
    var iat = Math.floor(Date.now());
    console.log('iat', iat);
    jwt.sign({
        username: username.user,
        iat: iat,
        project: username.project
    }, iat.toString(), {
        issuer: 'mTrainer'
    }, function(err, token) {
        if (err) {
            console.log("----------------------------");
            console.log("err", err);
            console.log(moment().format('MMMM Do YYYY, hh:mm:ss a') + " | There was an error in generating your token!");
            console.log("----------------------------");
        } else {
            console.log("----------------------------");
            console.log(moment().format('MMMM Do YYYY, hh:mm:ss a') + " | Your Token is : " + token);
            console.log("----------------------------", ' iat ', iat);
            callback(token);
        }
    });
}

//Function to verify JWT token
function verifyToken(token, key, username, fullUrl, callback) {
    // verify issuer
    jwt.verify(token.token, key, {
        issuer: 'mTrainer'
    }, function(err, decoded) {
        if (err) {
            console.log("----------------------------", err);
            console.log(moment().format('MMMM Do YYYY, hh:mm:ss a') + " | Invalid Public Key or Token!");
            console.log("----------------------------");
        } else {
            console.log(JSON.stringify(decoded))
            if (decoded.username == username) {
                console.log("----------------------------");
                console.log(moment().format('MMMM Do YYYY, hh:mm:ss a') + " | Token has been validated successfully with username : " + decoded.project);
                console.log("----------------------------",fullUrl + '/mTrainer/parse?q=' + token.input_text + '&project=' + decoded.project);
                unirest.get(fullUrl + '/mTrainer/parse?q=' + token.input_text + '&project=' + decoded.project)
                    .headers({
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    })
                    //.send({ "parameter": 23, "foo": "bar" })
                    .end(function(response) {
                        callback(response.body);
                    });
            } else {
                console.log("----------------------------");
                console.log(moment().format('MMMM Do YYYY, hh:mm:ss a') + " | Username associated with token is invalid : " + username);
                console.log("----------------------------");
                callback('not a valid token cannot use redirect to respective page.', decoded);
            }
        }
    });
}

/////////////Winston Logger/////////
var env = process.env.NODE_ENV || 'development';
var logDir = 'log';
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}
var logger = new(winston.Logger)({
    transports: [
        // colorize the output to the console
        new(winston.transports.Console)({
            timestamp: (new Date()).toUTCString(),
            colorize: true,
            level: 'info'
        }),
        new(winston.transports.File)({
            filename: 'log/results.log',
            handleExceptions: true,
            timestamp: (new Date()).toLocaleTimeString(),
            json: true,
            level: env === 'development' ? 'debug' : 'info'
        })
    ]
});


//Authorization and Authentication APIs START
app.post('/login/', function(req, res) {
    // res.send('Got a get request');
    var data1 = req.body;
    console.log("logging user");
    console.log(data1.email);
    var data = {
        "Data": "",
        "error": ""
    };
    var db = req.db;
    logger.info('Got a post request for authenticate');
    logger.info(data1.email);
    logger.info(data1.password);
    if (data1.email === '' || data1.password === '') {
        data["error"] = 1;
        data["Data"] = 'Please provide the required info';
        logger.info("userName or / and password are missing");
        res.json(data);
    } else {
        db.collection('users').findOne({
            _emailId: data1.email
        }, function(err, result) {
            if (err) {
                data["error"] = 1;
                data["Data"] = 'error in finding User Name / Email';
                console.log(data.Data);
                res.json(data);
            } else if (result) {
                if (result.length != 0) {
                    bcrypt.compare(data1.password, result.password, function(err, bcryptRes) {
                        if (bcryptRes === true) {
                            data["error"] = 0;
                            data["Data"] = result;
                            delete result.password;
                            logger.info("Passwords matched");
                            // logger.info(res);
                            // logger.info(data);
                            sendResponse(data);
                            logger.info(data1.email + "-" + bcryptRes);
                        } else {
                            data["error"] = 1;
                            data["Data"] = "Password not matched";
                            logger.info("Password not matched");
                            // logger.info(res);
                            // logger.info(data);
                            sendResponse(data);
                        }
                    });

                    function sendResponse(data) {
                        logger.info("=========data");
                        logger.info(data);
                        res.json(data);
                    }

                } else {
                    data["error"] = 1;
                    data["Data"] = 'Passwords Not Matched';
                    console.log(res);
                    res.json(data);
                }
            } else {
                if (data1.email) {
                    data["Data"] = data1.email + ' is not a registered User';
                } else {
                    data["Data"] = 'Please enter your username and password.';
                }
                data["error"] = 1;
                logger.warn(data.Data);
                res.json(data);
            }
        });
    }
});


//Model Related APIs Start
//**GET for getting available bots by an organisation Start/Refresh DB**//
app.get('/models/:user', function(req, res) { // Models retrieved based on username of the user logged in
    // res.send('Got a get request');
    var user = req.params.user; //username of logged in User
    logger.info('Got a GET request for available models in USR: ' + user);
    var data = {
        "Data": "",
        "error": ""
    };
    var db = req.db;
    db.collection('models').find({
        "user": user
    }).toArray(function(err, result) {
        if (result.length != 0) {
            data["error"] = 0;
            data["Data"] = result;
            res.json(data);
        } else {
            data["error"] = 1;
            data["Data"] = 'No Models found..';
            res.json(data);
        }
    });
});
//**GET for getting available Models by an organisation Start/Refresh**//

//**GET for getting model's intents by Model id DB Start //
app.get('/intents/:activeModelIntents', function(req, res) { //V0.3
    // res.send('Got a get request');
    var data = {
        "Data": "",
        "error": ""
    };

    var intents = req.params.activeModelIntents;
    console.log(req.params);
    console.log(req.params.activeModelIntents);
    logger.info("Search for Intents in:");
    intents = intents.split(",");
    logger.info(intents);
    var intentIds = [];
    intents.forEach(function(stringId) {
        intentIds.push(new ObjectId(stringId));
    });

    var db = req.db;
    logger.info('Got a GET request for Intents in Model: ' + intentIds);
    db.collection('intents').find({
        _id: {
            $in: intentIds
        }

    }).toArray(function(err, result) {
        if (err === 0) {
            logger.warn("Error in get model intents req");
            logger.warn(err);
        } else {
            if (result.length != 0) {
                data["error"] = 0;
                data["Data"] = result;
                console.log(result);
                res.json(data);

            } else {
                data["error"] = 1;
                data["Data"] = 'No intents found..';
                res.json(data);
            }
        }
    });
});

app.put('/entities/', function(req, res) {
    logger.info("entered '/entities'");

    var data = {
        "Data": "",
        "error": ""
    };
    console.log("printing request");
    console.log(req.body);
    var modelId = req.body.modelId;
    var db = req.db;


    if (req.body.entities != undefined) {
        var entityArray = req.body.entities;
        console.log(entityArray);
        //each object of entityArray will be {eId: "", eName: ""}


        logger.info('Got a put request to push entity in model: ' + modelId);
        if (entityArray.length > 0) {
            db.collection('models').update({
                _id: ObjectId(modelId)
            }, {
                $push: {
                    "entities": {
                        $each: entityArray
                    }
                }
            }, function(err, result) {
                if (result.length != 0) {
                    data["error"] = 0;
                    data["Data"] = result;
                    data.modified = entityArray;
                    logger.info("Successfully pushed an Entities");
                    res.json(data);

                } else {
                    data["error"] = 1;
                    data["Data"] = 'unable to insert the Entities in Model';
                    logger.info("failed Pushing an Entities");
                    res.json(data);
                }
            });
        };
    };
});
//put for adding an Entity END

//put for Editing the Entity in the mapping START
app.put('/mappings/', function(req, res) {
    var data = {
        "Data": [],
        "error": []
    };
    logger.info("put request for Updating an Entity in mapping");
    var entityData = req.body;
    console.log(".............................................");
    console.log(JSON.stringify(entityData));
    var db = req.db;
    var count = 0;
    for (var i = 0; i < entityData.length; i++) {
        var intentId = entityData[i]._id,
            utterances = entityData[i].utterances;
        logger.info("Updating In Intent: " + intentId);
        logger.info("Updating Utterances: " + utterances);
        db.collection('intents').update({
            _id: ObjectId(intentId)
        }, {
            $set: {
                utterances: utterances
            }
        }, function(err, response) {
            if (response.length != 0) {
                data.error.push(0);
                data.Data.push(response);
                logger.info("Successfully edited an Entity Mapping");
                count++;
                if (count === (entityData.length)) {
                    sendResult(data);
                }

            } else {
                data.error.push(1);
                data.Data.push('Failed editing an Entity Mapping..');
                logger.info("failed editing an Entity Mapping");
                count++;
                if (count === (entityData.length)) {
                    sendResult(data);
                }
            }
        });

    }
    var sendResult = function(result) {
        res.json(result)
    };
});
//put for Editing the Entity in the mapping END

///Entities End

//put for Editing the Model in the mapping START
app.put('/models/', function(req, res) {

    var data = {
        "Data": [],
        "error": []
    };
    var modelId = req.body._id;
    var updateData = req.body.updateData;

    var db = req.db;

    logger.info("Updating model: " + modelId);
    db.collection('models').update({
        _id: ObjectId(modelId)
    }, {
        $set: updateData
    }, function(err, response) {
        if (response.length != 0) {
            data["error"] = 0;
            data["Data"] = response;
            logger.info("Successfully updated the model");
            res.json(data);

        } else {
            data["error"] = 1;
            data["Data"] = 'unable to update model';
            logger.info("Failed - Could not update the model.");
            res.json(data);
        }
    });


});
//put for updating the entities list in models END

// for creating, editing and deleting entities

//todo common db call for add, update, delete entity
// For creating, editing and deleting entities end here


///***Intents Start***///
///**put to add new Intent ID to the Modelnformation Start**// V0.3
app.put('/pushIntentId/', function(req, res) {
    logger.info("entered '/pushIntentId'");
    var data = {
        "Data": "",
        "error": ""
    };
    console.log(JSON.stringify(req.body));
    var intentId = req.body.intentId;

    var modelId = req.body.modelId;
    // var modelId = req.params;
    var db = req.db;
    logger.info('Got a put request for add intent in model: ' + modelId);
    logger.info('Put intent in: ' + modelId);
    logger.info(' intent: ' + intentId);
    if (intentId.length > 1) {
        db.collection('models').update({
            _id: ObjectId(modelId)
        }, {
            $push: {
                "intents": {
                    $each: intentId
                }
            }
        }, function(err, result) {
            if (result.length != 0) {
                data["error"] = 0;
                data["Data"] = result;
                logger.info("Successfully pushed an Intent Id");
                res.json(data);

            } else {
                data["error"] = 1;
                data["Data"] = 'unable to link the Intent ID to Model';
                logger.info("failed Pushing an Intent ID");
                res.json(data);
            }
        });
    } else {
        intentId.toString();
        db.collection('models').update({
            _id: ObjectId(modelId)
        }, {
            $push: {
                "intents": intentId[0]
            }
        }, function(err, result) {
            if (result.length != 0) {
                data["error"] = 0;
                data["Data"] = result;
                logger.info("Successfully pushed an Intent Id");
                res.json(data);

            } else {
                data["error"] = 1;
                data["Data"] = 'unable to link the Intent ID to Model';
                logger.info("failed Pushing an Intent ID");
                res.json(data);
            }
        });
    }
});
///**put to add new Intent ID to the Modelnformation End**//

//*DELETE for deleting an intent from a model V0.3
app.delete('/intents/:intentId', function(req, res) {
    // res.send('Got a get request');
    var data = {
        "Data": "",
        "error": ""
    };
    var intentId = req.params.intentId;
    logger.info('Got a delete request for deleting an Intent in model: ' + intentId);
    db.collection('intents').remove({
        _id: ObjectId(intentId)
    }, function(err, result) {
        if (result.length !== 0) {
            data["error"] = 0;
            data["Data"] = result;
            logger.info("Successfully Deleted an Intent");
            res.json(data);

        } else {
            data["error"] = 1;
            data["Data"] = 'No Intents found..';
            logger.info("failed deleting an Intent");
            res.json(data);
        }
    });
});

//put for renaming the Intent
app.put('/intents/', function(req, res) {
    var data = {
        "Data": "",
        "error": ""
    };
    var intentId = req.body.intentId,
        newIntentName = req.body.newName;
    logger.info('Got a put request for renaming Intent : ' + intentId);
    logger.info('Got a put request for renaming Intent to: ' + newIntentName);
    db.collection('intents').update({
        _id: ObjectId(intentId)
    }, {
        $set: {
            intent: newIntentName
        }
    }, function(err, response) {
        if (response.length !== 0) {
            data["error"] = 0;
            data["Data"] = response;
            logger.info("Successfully renamed an Intent");
            res.json(data);

        } else {
            data["error"] = 1;
            data["Data"] = 'No Intents found..';
            logger.info("failed renaming an Intent");
            res.json(data);
        }
    })
});

//Pull Intent Id from the the active model V0.3
app.put('/pullIntentId/', function(req, res) {
    var data = {
        "Data": "",
        "error": ""
    };
    // var entityName = req.body.entityName;
    logger.info("entered pullIntentId//////////////////////////////////");
    var intentData = req.body;
    intentId = intentData.intentId;
    modelId = intentData.modelId;
    modelId = new ObjectId(modelId);
    // var activeModel = req.params.activeModel;
    var db = req.db;
    // logger.info('req.body: '+JSON.stringify(req.body));
    logger.info('Got a put request pulling an intent Id from model: ' + modelId);
    logger.info('Got a put request pulling an intent Id: ' + intentId);
    // logger.info('entityName' + entityName);
    // logger.info('activeModel' + activeModel);
    db.collection('models').update({
        _id: modelId
    }, {
        $pull: {
            intents: {
                $in: [intentId]
            }
        }
    }, function(err, result) {
        if (result.length !== 0) {
            data["error"] = 0;
            data["Data"] = result;
            logger.info("Successfully Pulled an IntentId");
            res.json(data);

        } else {
            data["error"] = 1;
            data["Data"] = 'No intents found..';
            logger.info("failed Pulling an IntentID");
            res.json(data);
        }
    });
});
///////

///**post to add new utterance to Intent to the Model Start**// V0.3
app.post('/utterances/:intentId', function(req, res) {
    // res.send('Got a get request');
    var data = {
        "Data": "",
        "error": ""
    };
    var utterance = req.body;
    var intentId = req.params.intentId;
    // var activeModel = req.params.activeModel;

    var db = req.db;
    logger.info('Got a post request for add utterance////////////  ');
    // logger.info('post intent in: ' + intentId);
    logger.info(' utterance: ' + JSON.stringify(utterance));
    logger.info(' Utterance to intent: ' + intentId);
    db.collection('intents').update({
        _id: ObjectId(intentId)
    }, {
        $push: {
            "utterances": utterance
        }
    }, function(err, response) {
        if (response.length !== 0) {
            data["error"] = 0;
            data["Data"] = response;
            logger.info("Successfully added an Utterance");
            logger.info(JSON.stringify(response));
            res.json(data);

        } else {
            data["error"] = 1;
            data["Data"] = 'failed adding an Utterance..';
            logger.info("failed adding an Utterance");
            res.json(data);
        }
    });
});
///**post to add new utterance to Intent to the Model End**//
//** DELETE to Delete an Utterance
app.delete('/utterances/:utterance/:intentId', function(req, res) {
    // res.send('Got a get request');
    var data = {
        "Data": "",
        "error": ""
    };
    // console.log(JSON.stringify(req.body.data));
    // var request = req.body.data;
    var intentId = req.params.intentId;
    var utterance = req.params.utterance;
    logger.info('Got a delete request for deleting an Utterance in Intent: ' + intentId);
    logger.info('Got a delete request for deleting an Utterance : ' + utterance);
    db.collection('intents').update({
        _id: ObjectId(intentId)
    }, {
        $pull: {
            utterances: {
                "utterance": utterance
            }
        }
    }, function(err, result) {
        if (result.length !== 0) {
            data["error"] = 0;
            data["Data"] = result;
            logger.info("Successfully Deleted an Utterance");
            res.json(data);

        } else {
            data["error"] = 1;
            data["Data"] = 'No Intents found..';
            logger.info("failed deleting an Utterance");
            res.json(data);
        }
    });
});

//** DELETE for deleting a mapping form the utterance V0.3
app.delete('/mappings/:fromIntent/:inUtterance/:mappingValue/:mappingEntity', function(req, res) {
    var data = {
        "Data": "",
        "error": ""
    };
    var intentId = req.params.fromIntent,
        inUtterance = req.params.inUtterance,
        mappingValue = req.params.mappingValue,
        mappingEntity = req.params.mappingEntity;
    logger.info('Got a delete request for deleting a mapping from Intent: ' + intentId);
    logger.info('Got a delete request for deleting a mapping in utterance : ' + inUtterance);
    logger.info('Got a delete request for deleting a mapping value : ' + mappingValue);
    logger.info('Got a delete request for deleting a mapping Entity : ' + mappingEntity);

    db.collection('intents').update({
        _id: ObjectId(intentId),
        "utterances.utterance": inUtterance
    }, {
        $pull: {
            "utterances.$.entities": {
                "value": mappingValue,
                "entity": mappingEntity
            }
        }
    }, function(err, result) {
        if (result.length !== 0) {
            data["error"] = 0;
            data["Data"] = result;
            logger.info("Successfully Deleted an Utterance mapping");
            res.json(data);

        } else {
            data["error"] = 1;
            data["Data"] = 'No Intents found..';
            logger.info("failed deleting an Utterance ,mapping");
            res.json(data);
        }
    });
});

app.post('/mappings/:toIntentId/:toUtterance', function(req, res) {
    // res.send('Got a get request');
    var data = {
        "Data": "",
        "error": ""
    };
    var mappingData = req.body;
    var intentId = req.params.toIntentId;
    var utterance = req.params.toUtterance;
    console.log("post for adding an Entity Mapping: " + JSON.stringify(mappingData));
    console.log("adding an Entity Mapping to Intent: " + intentId);
    console.log("adding an Entity Mapping to utterance: " + utterance);
    db.collection('intents').update({
        _id: ObjectId(intentId),
        "utterances.utterance": utterance
    }, {
        "$push": {
            "utterances.$.entities": mappingData
        }
    }, function(err, response) {
        if (response.length !== 0) {
            data["error"] = 0;
            data["Data"] = response;
            logger.info("Successfully added an Entity Mapping");
            logger.info(JSON.stringify(response));
            res.json(data);

        } else {
            data["error"] = 1;
            data["Data"] = 'failed adding an Entity Mapping..';
            logger.info("failed adding an Entity Mapping");
            res.json(data);
        }
    });

});

///***Intents TAB End***///

///***Global(on model create and delete) Start***///
// Adding new Model to the models collection to DB
app.post('/models/', function(req, res) {
    // res.send("got from post");

    console.log('at post odels')

    logger.info("post req to create new model");
    logger.info(req.body);
    // console.log(req.body);
    var data = {
        "error": 1,
        "Data": ""
    };
    var model = req.body;

    if (req.body) {
        db.collection('models').insert(model, function(err, result) {
            if (!!err) {
                data["error"] = 1;
                data["Data"] = "Error Adding new Model";
                logger.warn("Failed creating a new Model. Please try Again!!");
            } else {
                data["error"] = 0;
                logger.info("created new Model");
                logger.info(result);
                data["Data"] = model;
                // console.log(data["Data"]);
                console.log(data);
                console.log("\n ==========");
            }
            res.json(data);
        });
    } else {
        data["Data"] = "Model Creation failed Please try Again!!";
        logger.warn("didn't have req.body");
        res.json(data);
    }

});

// Adding Intent document to the intents collection to DB
app.post('/intents/', function(req, res) {
    // res.send("got from post");

    var data = {
        "Data": "",
        "error": ""
    };
    var reqData = req.body;
    var intents = reqData.intents,
        responseData = [],
        responseObj = {};


    var db = req.db;
    logger.info('Got a post request for add UploadedModelIntents////////////  ');
    // logger.info('post intent in: ' + intentId);
    logger.info(' Intents: ' + JSON.stringify(intents));

    if (!!req.body) {
        db.collection('intents').insertMany(intents, function(err, result) {
            if (!!err) {
                data["error"] = 1;
                data["Data"] = "Error Adding Intent / Intents";
                logger.warn("Failed creating a new intent. Please try Again!!");
            } else {
                data["error"] = 0;
                logger.info("created new Intent/Intents");
                logger.info(JSON.stringify(result));
                //logger.info(intents._id.toString());
                for (var i = 0; i < intents.length; i++) {
                    responseData.push(intents[i]._id.toString());
                }
                responseObj.intentIds = responseData;
                data["Data"] = responseObj;
            }
            res.json(data);
        });
    } else {
        data["Data"] = "Bot Intents Creation failed Please try Again!!";
        logger.warn("didn't have req.body");
        res.json(data);

    }

});

// Adding new Model's Entity document to the entities collection to DB V0.3
/*app.post('/entities/', function (req, res) {
    // res.send("got from post");
    logger.info("post req to create Entity document for new model");
    logger.info(req.body);
    var data = {
        "error": 1,
        "Data": ""
    };
    var reqData = req.body;
    var entities = reqData.entities, responseData = [], responseObj = {};
    console.log("show entities");
    console.log(entities);
    if (!!req.body) {
        db.collection('models').insertMany(entities, function (err, result) {
            if (!!err) {
                data["error"] = 1;
                data["Data"] = "Error Adding data";
                logger.warn("Failed creating a new entity doc. Please try Again!!");
            } else {
                data["error"] = 0;
                logger.info("created new Model Entity");
                for (var i = 0; i < entities.length; i++) {
                    responseData.push(entities[i]._id.toString());
                }
                responseObj.entityIds = responseData;
                data["Data"] = responseObj;
            }
            res.json(data);
        });
    } else {
        data["Data"] = "No entity info found to create a new Entity!!";
        logger.warn("didn't have req.body");
        res.json(data);

    }

});*/

//*DELETE for deleting a Model by modelId  in  DB Start //
app.delete('/models/:modelId', function(req, res) {
    // res.send('Got a get request');
    var data = {
        "Data": "",
        "error": ""
    };
    // var entityName = req.body.entityName;
    var modelId = req.params.modelId;
    logger.info('Got a delete request for deleting a model: ' + modelId);
    /*var activeModel = req.params.activeModel;
     var db = req.db;
     // logger.info('req.body: '+JSON.stringify(req.body));
     logger.info('Got a delete request for deleting an Entity in model: ' + activeModel);
     logger.info('entityName' + entityName);
     logger.info('activeModel' + activeModel);*/
    db.collection('models').remove({
            "_modelId": modelId
        },
        function(err, result) {
            if (result.length !== 0) {
                data["error"] = 0;
                data["Data"] = result;
                logger.info("Successfully Deleted a model");
                res.json(data);
            } else {
                data["error"] = 1;
                data["Data"] = 'Failed deleting the model.';
                logger.info("failed deleting a Model");
                res.json(data);
            }
        }
    );
});
//**DELETE for deleting a Model by modelId  in  DB End**//

/*//!*DELETE for deleting a Model's whole Entities by modelId  in  DB Start //
 app.delete('/deleteWholeEntitiesOfModel/:modelId', function (req, res) {
 // res.send('Got a get request');
 var data = {
 "Data": "",
 "error": ""
 };
 var modelId = req.params.modelId;
 logger.info('Got a delete request for deleting Entities of Model: ' + modelId);
 db.collection('modelEntities').remove(
 {"_modelId": modelId},
 function (err, result) {
 if (result.length != 0) {
 data["error"] = 0;
 data["Data"] = result;
 logger.info("Successfully Deleted Entities of a model");
 res.json(data);
 } else {
 data["error"] = 1;
 data["Data"] = 'No intents found..';
 logger.info("failed deleting Entities of a Model");
 res.json(data);
 }
 }
 );
 });
 //!**DELETE for deleting a Model's whole Entities by modelId  in  DB End**!//*/

/*
 //!*DELETE for deleting a Model's whole Intents by modelId  in  DB Start //
 app.delete('/deleteWholeIntentsOfModel/:modelId', function (req, res) {
 // res.send('Got a get request');
 var data = {
 "Data": "",
 "error": ""
 };
 var modelId = req.params.modelId;
 logger.info('Got a delete request for deleting Intents of Model: ' + modelId);
 db.collection('modelIntents').remove(
 {"_modelId": modelId},
 function (err, result) {
 if (result.length != 0) {
 data["error"] = 0;
 data["Data"] = result;
 logger.info("Successfully Deleted Intents of a model");
 res.json(data);
 } else {
 data["error"] = 1;
 data["Data"] = 'No intents found..';
 logger.info("failed deleting Intents of a Model");
 res.json(data);
 }
 }
 );
 });
 //!**DELETE for deleting a Model's whole Intents by modelId  in  DB End**!//
 */

/*
logger.info("Oh snap!!");
logger.info('Hello world');
logger.warn('Warning message');
logger.debug('Debugging info');*/

//API to generate a JWT Token
app.post('/publish', function(req, res) {
    console.log(req.body);
    var fullUrl = req.protocol + '://' + req.get('host');
    generateToken(req.body, function(token) {
        res.status(200).send({
            'API': fullUrl + '/jwt_verify',
            'token': token
        });
    })
})

//decoding and verifying the API
app.post('/jwt_verify', bruteforce.prevent, function(req, res) {
    //var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    var fullUrl = req.protocol + '://' + req.get('host');
    console.log(fullUrl);
    var decoded = jwt.decode(req.body.token);

    verifyToken(req.body, (decoded.iat).toString(), decoded.username, fullUrl, function(decoded) {
        res.send(decoded);
    })

});

////////Testing API
app.get('/test/:productname', function(req, res) { //Train Model
    logger.info();
    logger.info(req.params.productname);
    res.send(req.params.productname);

});

app.use(express.static(__dirname + '/'));

app.listen("5001", function() {
    logger.info('up and running at 5000! opens mTrainer');
});
