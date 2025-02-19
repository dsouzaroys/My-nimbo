const express = require("express");
const mongoose = require("mongoose");
require('express-router-group');
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
require("dotenv").config();
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const cors = require("cors");
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const i18next = require("i18next");
const Backend = require("i18next-fs-backend");
const middleware = require("i18next-http-middleware");
const rateLimit = require('express-rate-limit');
const passport = require("passport");

const indexRouter = require("./routes/index");
const apiResponse = require("./helpers/apiResponse");
const errorHandler = require("./middlewares/error-handler");

const app = express();
const MONGODB_URL = process.env.MONGODB_URL;

i18next.use(Backend).use(middleware.LanguageDetector).init({
    fallbackLng: 'en',
    backend: {
        loadPath: './locales/{{lng}}/translation.json'
    }
});

const SimpleNodeLogger = require('simple-node-logger'),
    opts = {
        logFilePath: 'logs.log',
        timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
    },
log = SimpleNodeLogger.createSimpleLogger(opts);


// DB connection.
mongoose.set('strictQuery', true);
mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    log.info("Connected to ", process.env.PORT);
    log.info("Connected to ", MONGODB_URL);
    log.info("App is running ... \n");
    console.log("Connected to %s", process.env.PORT);
    console.log("Connected to %s", MONGODB_URL);
    console.log("App is running ... \n");
    console.log("Press CTRL + C to stop the process. \n");
}).catch(err => {
    console.error("App starting error:", err.message);
    process.exit(1);
});


//don't show the log when it is test
if (process.env.NODE_ENV !== "test") {
    app.use(logger("dev"));
}

app.use(cookieParser());
app.use(passport.initialize());

app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    abortOnLimit: true
}));
app.use(middleware.handle(i18next));

//To allow cross-origin requests
app.use(cors());

app.use((req, res, next) => {
    if (req.originalUrl === '/api/v1/webhook') {
      next();
    } else {
        bodyParser.json()(req, res, next);
    }
});

app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
	extended: true
}));

// Set up rate limiting for all routes
app.use(
    rateLimit({
    //   windowMs: 15 * 60 * 1000, // 15 minutes
        windowMs: 5 * 1000, // % seconds 
        max: 10000 // limit each IP to 5 requests per windowMs
    })
);

// Routes.
app.use("/", indexRouter);

app.use(errorHandler);
// throw 404 if URL not found
app.all("*", function (req, res) {
    return apiResponse.notFoundResponse(res, 404, "Page not found.");
});

app.use((err, req, res) => {
    if (err.name == "UnauthorizedError") {
        log.error(JSON.stringify(err));
        return apiResponse.unauthorizedResponse(res, 401, err.message);
    }
});

module.exports = app;