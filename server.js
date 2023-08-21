var express = require('express');
var createError = require('http-errors');
var path = require('path');
var bodyParser = require('body-parser');
var livereload = require('livereload');
var connectLiveReload = require('connect-livereload');
var app = express();
var PORT = 3000;
var COLORS = {
    CYAN: '\u001b[36m',
    WHITE: '\u001b[37m'
};
var liveReloadServer = livereload.createServer();
liveReloadServer.server.once('connection', function () {
    setTimeout(function () {
        liveReloadServer.refresh('/');
    }, 100);
});
app.use(connectLiveReload());
app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, function () { return console.log("".concat(COLORS.CYAN, "Server is running on http://localhost:").concat(PORT).concat(COLORS.WHITE)); });
// serve the css & js as static
app.use(express.static(__dirname));
// get our app to use body parser
app.use(bodyParser.urlencoded({ extended: true }));
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/');
});
