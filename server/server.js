var loopback = require('loopback');
var boot = require('loopback-boot');
var nodemailer = require('nodemailer');
var path = require('path');
var fs = require('fs');
var app = module.exports = loopback();
app.start = function () {
    // start the web server
    return app.listen(function () {
        app.set('view engine', 'ejs');
        app.emit('started');
        var baseUrl = app.get('url').replace(/\/$/, '');
        console.log('Web server listening at: %s', baseUrl);
        if (app.get('loopback-component-explorer')) {
            var explorerPath = app.get('loopback-component-explorer').mountPath;
            console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
        }
    });
};


app.get('**', function (req, res, next) {
    var url = path.join(__dirname, '..', req.url)
    var isGetFile = req.url.includes("storages");
    fs.exists(url, function (exists) {
        if (exists && isGetFile) {
            // Do something
            res.sendFile(path.join(__dirname, '..', req.url))
        }
        else if (!exists && isGetFile) {
            console.log("exxx")
            res.sendFile(path.join(__dirname, '../storages/missing/missing-image.png'))
        }
        else {
            next();
        }
    });

})
// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
    if (err) throw err;

    // start the server if `$ node server.js`
    if (require.main === module)
        app.start();
});
