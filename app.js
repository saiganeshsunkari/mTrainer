//Require Node Modules
var express = require('express');
var moment = require('moment');

//Initialize Variables
var app = express();
var port = 2376;

//Server Starts and Listens
app.listen(port, function() {
    console.log("--------------------------------------------------------");
    console.log(moment().format('MMMM Do YYYY, hh:mm:ss a') + " | mTraner Server has been started!");
    console.log("--------------------------------------------------------");
});
