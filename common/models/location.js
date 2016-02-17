module.exports = function (Location) {
    var appRoot = require('../../server/server');
    var parse = require('excel');
    var uuid = require('node-uuid');
    var Report = require('fluentreports').Report;
    var fs = require('fs')
    // Decoding base-64 image
    function decodeBase64Image(base64String) {
        if(typeof(base64String) == 'undefined'){
            return null;
        }
        var matches = base64String.match(/data:application\/vnd\.openxmlformats\-officedocument\.spreadsheetml\.sheet;base64,/);
        if (matches != null) {
            var dataString = data = base64String.replace('data:application\/vnd\.openxmlformats\-officedocument\.spreadsheetml\.sheet;base64,', '');
            var fileBuffer = new Buffer(dataString, 'base64');
            return fileBuffer;
        }
    }
    
    
    //upload file
    Location.beforeRemote('export', function (context, mediaInstance, next) {
        //convert req body data to image
        var data = decodeBase64Image(context.req.body.data);
        if (data != null) {
            var name = uuid.v1();
            var temporaryFilePath = 'storages/' + name + '.xlsx';
            var records = [];
            fs.writeFile(temporaryFilePath, data, function (err) {
                parse(temporaryFilePath, function (err, result) {
                    records = result;
                    var resultJson = [];
                    fs.unlink(temporaryFilePath);
                    var headers = [];
                    result.forEach(function (element, index, array) {
                        if (index == 0) {
                            headers = element;
                        }
                        else {
                            var object = {};
                            headers.forEach(function (headerElement, headerIndex, headerArray) {
                                object[headerElement] = element[headerIndex];
                            })

                            resultJson.push(object);
                            if (records.length - 1 == resultJson.length) {
                                var returnResponse = {};
                                returnResponse.status = 200;
                                Location.create(resultJson, function (err, locationResult) {
                                    returnResponse.data = locationResult;
                                    return context.res.status(200).send(returnResponse);
                                });
                            }
                        }
                    });
                })
            });

        }
        else {
            var error = new Error();
                                    error.name = 'Bad Request'
                                    error.status = 400;
                                    error.message = 'Bad Request';
                                    error.code = 'BAD REQUEST';
                                    return next(error);
        }
    });

    //generate file
    Location.beforeRemote('generate', function (context, mediaInstance, next) {
        var accessToken = appRoot.models.AccessToken;

        var roleMapping = appRoot.models.RoleMapping;
        //check whether access token is valid or not
        accessToken.findById(context.req.headers.authorization, function (err, accessTokenResult) {
            if (accessTokenResult != null) {
                var accessTokenRes = accessTokenResult;
                accessTokenResult.validate(function (err, isValid) {
                    if (isValid) {

                        if (accessTokenRes.__data.userId) {
                            Location.find(function (err, locationResult) {
                                var results = [];
                                locationResult.forEach(function (element, index, array) {
                                    var object = element.__data;
                                    object.locationId = object.id;
                                    object.id = 1;
                                    results.push(object);
                                })
                                if (results.length == 0) {
                                    var error = new Error();
                                    error.name = 'Empty Result'
                                    error.status = 404;
                                    error.message = 'Empty Result';
                                    error.code = 'Empty Result';
                                    return next(error);

                                }
                                else {
                                    Location.generatePDFFile(results, accessTokenRes.__data.userId, context);
                                }
                            });
                        }
                    } else {
                        var error = new Error();
                        error.name = 'Unauthorized'
                        error.status = 401;
                        error.message = 'Invalid Access Token';
                        error.code = 'INVALID_TOKEN';
                        return next(error)
                    }
                });
            }
            else {
                var error = new Error();
                error.name = 'Unauthorized'
                error.status = 401;
                error.message = 'Invalid Access Token';
                error.code = 'INVALID_TOKEN';
                return next(error)
            }
        });
    });

    //generate PDF file based on data
    Location.generatePDFFile = function (generatedData, userId, context) {
        var count = 0;
        //as a hader report
        var header = function (rpt, data) {
            if (count > 0) {
                return;
            }
            else {
                count++;
                // Date Printed - Top Right
                rpt.fontSize(9);
                rpt.print(new Date().toString('MM/dd/yyyy'));

                // Report Title
                rpt.print('Location Report', { fontBold: true, fontSize: 16, align: 'right' });
                rpt.newline();
                rpt.newline();
                rpt.newline();

                // Detail Header
                rpt.fontBold();
                rpt.band([
                    { data: 'ID', width: 30 },
                    { data: 'Location', width: 30 },
                    { data: 'Project', width: 30 }
                ]);
                rpt.fontNormal();
                rpt.bandLine();
            }
        };

        var detail = function (rpt, data) {
            // Detail Body
            rpt.band([
                { data: data.locationId, width: 200 },
                { data: data.location, width: 200, align: 1 },
                { data: data.project, width: 200 }
            ]
                , { border: 1, width: 0 });
        };


        //check directory is exist or not
        if (!fs.existsSync('storages/' + userId + '/report')) {
            fs.mkdirSync('storages/' + userId + '/report', function (err) {

            });
        }

        //generate unique ID
        var reportName = uuid.v1();
        
        var rptName = 'storages/' + userId + '/report/' + reportName + '.pdf';

        var resultReport = new Report(rptName)
            .data(generatedData);
            
        // Settings
        resultReport
            .fontsize(9)
            .margins(8)
            .detail(detail)
            .groupBy('id')
            .header(header, { pageBreakBefore: true })
        ;

        resultReport.printStructure();

        resultReport.render(function (err, name) {
            var generatedFile = {};
            generatedFile.url = name;
            return context.res.status(200).send(generatedFile);
        }, function (err) {
            console.log(err);
        });
    }

    Location.remoteMethod(
        'export',
        {
            description: 'export a file to web service',
            accepts: [
                { arg: 'Objects', type: 'object', required: true, http: { source: 'body' } }],

            http: { verb: 'post' }
        }
        );

    Location.remoteMethod(
        'generate',
        {
            description: 'generate PDF file',
            accepts: [
                { arg: 'Objects', type: 'object', required: true, http: { source: 'body' } }],

            http: { verb: 'post' }
        }
        );
};
