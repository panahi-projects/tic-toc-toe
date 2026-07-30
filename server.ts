// Imports
const express = require('express');
const createError = require('http-errors');
const path = require('path');
const bodyParser = require('body-parser');
const livereload = require('livereload');
const connectLiveReload = require('connect-livereload');

// Variable defines:
const app = express();
const PORT: number = 3000;
const COLORS = {
    CYAN: '\u001b[36m',
    WHITE: '\u001b[37m'
};

const liveReloadServer = livereload.createServer();
liveReloadServer.server.once('connection', () => {
    setTimeout(() => {
        liveReloadServer.refresh('/');
    }, 100);
});

app.use(connectLiveReload());
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`${COLORS.CYAN}Server is running on http://localhost:${PORT}${COLORS.WHITE}`));

// serve the css & js as static
app.use(express.static(__dirname));
// get our app to use body parser
app.use(bodyParser.urlencoded({ extended: true }));

// catch 404 and forward to error handler
app.use(function (req: unknown, res: unknown, next: any) {
    next(createError(404));
});
app.get('/', (req: unknown, res: any) => {
    res.sendFile(__dirname + '/');
});
