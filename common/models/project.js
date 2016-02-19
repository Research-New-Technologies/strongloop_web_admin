module.exports = function (Project) {
    var appRoot = require('../../server/server');
    var parse = require('excel');
    var uuid = require('node-uuid');
    var Report = require('fluentreports').Report;
    var fs = require('fs')
    // Decoding base-64 image
    function decodeBase64Image(base64String) {
        if (typeof (base64String) == 'undefined') {
            return null;
        }
        var matches = base64String.match(/data:application\/vnd\.openxmlformats\-officedocument\.spreadsheetml\.sheet;base64,/);
        if (matches != null) {
            var dataString = data = base64String.replace('data:application\/vnd\.openxmlformats\-officedocument\.spreadsheetml\.sheet;base64,', '');
            var fileBuffer = new Buffer(dataString, 'base64');
            return fileBuffer;
        }
    }

    Project.insertData = function (array, index, context, next) {
        if(index == array.length){
           Project.find({ include: { relation: 'level', scope: { include: { relation: 'zone' } } } }, function(err, results){
               var result = {};
               result.data = results;
             return context.res.status(200).send(result);
           })
           
           
        }
        else {
        var element = array[index];
        var level = appRoot.models.level;
        var zone = appRoot.models.zone;
        Project.find({ where: { project: element[0].toString() } }, function (err, projectResponse) {
            if (projectResponse.length != 0) {
                
                level.find({ where: { level: element[1], } }, function (err, levelResponse) {
                    if (levelResponse.length != 0) {
                    
                        zone.find({ where: { zone: element[2], } }, function (err, zoneResponse) {
                            if (zoneResponse.length != 0) {
                                index = index + 1;
                                    Project.insertData(array, index,context,  next);
                            }
                            else {
                                zone.create({ zone: element[2], levelId: levelResponse[0].__data.id }, function (err, zoneCreateResult) {
                                         index = index + 1;
                                    Project.insertData(array, index,context,  next);
                                })
                            }

                        })
                    }
                    else {
                        level.create({ level: element[1], projectId: projectResponse[0].__data.id }, function (err, levelCreateResult) {
                            zone.create({ zone: element[2], levelId: levelCreateResult.id }, function (err, zoneCreateResult) {
                                     index = index + 1;
                                    Project.insertData(array, index, context, next);
                            })
                        })
                    }
                })
            }
            else {
                Project.create({ project: element[0] }, function (err, projectCreateResult) {
                    level.create({ level: element[1], projectId: projectCreateResult.id }, function (err, levelCreateResult) {
                        zone.create({ zone: element[2], levelId: levelCreateResult.id }, function (err, projectCreateResult) {
                               index = index + 1;
                             Project.insertData(array, index,context,  next);
                        })
                    })
                })
            }
        })
         }
    }
    
    Project.beforeRemote('find', function(context, mediaInstance, next){
         Project.find({ include: { relation: 'level', scope: { include: { relation: 'zone' } } } }, function(err, projectResult){
            return context.res.status(200).send(projectResult);
         });
    })
    
    //upload file
    Project.beforeRemote('export', function (context, mediaInstance, next) {


        //convert req body data to image
        var data = decodeBase64Image(context.req.body.data);
        if (data != null) {
            var name = uuid.v1();
            var temporaryFilePath = 'storages/' + name + '.xlsx';
            var records = [];
            fs.writeFile(temporaryFilePath, data, function (err) {
                parse(temporaryFilePath, function (err, result) {
                    records = result;
                    fs.unlink(temporaryFilePath);
                    var headers = [];
                            headers = result[0];
                            var index = 1;
                         Project.insertData(result, index, context, next);
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
    Project.beforeRemote('generate', function (context, mediaInstance, next) {
        var accessToken = appRoot.models.AccessToken;

        var roleMapping = appRoot.models.RoleMapping;
        //check whether access token is valid or not
        accessToken.findById(context.req.headers.authorization, function (err, accessTokenResult) {
            if (accessTokenResult != null) {
                var accessTokenRes = accessTokenResult;
                accessTokenResult.validate(function (err, isValid) {
                    if (isValid) {

                        if (accessTokenRes.__data.userId) {
                            Project.find({ include: { relation: 'level', scope: { include: { relation: 'zone' } } } }, function(err, projectResult){
                                var results = [];
                                projectResult.forEach(function (element, index, array) {
                                    var object = element.__data;
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
                                    Project.generatePDFFile(results, accessTokenRes.__data.userId, context);
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
    Project.generatePDFFile = function (generatedData, userId, context) {
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
                rpt.print('Project Report', { fontBold: true, fontSize: 16, align: 'right' });
                rpt.newline();
                rpt.newline();
                rpt.newline();

                // Detail Header
                rpt.fontBold();
                rpt.band([
                    { data: 'Project', width: 30 },
                    { data: 'Level', width: 30 },
                    { data: 'Zone', width: 30 }
                ]);
                rpt.fontNormal();
                rpt.bandLine();
            }
        };

        var detail = function (rpt, data) {
            data.level.forEach(function(element, index, array){
                var zone = element.__data.zone;
                zone.forEach(function(zoneElement, index, array){
            rpt.band([
                { data: data.project, width: 150 },
                { data: element.level, width: 150, align: 10 },
                { data: zoneElement.zone, width: 150 }
            ]
                , { border: 1, width: 0 });
                 
            })   
            })
        };


        //check directory is exist or not
        if (!fs.existsSync('storages/' + userId + '/report')) {
            fs.mkdirSync('storages/' + userId + '/report', function (err) {

            });
        }

 var footerFunction = function(Report) {
        Report.line(Report.currentX(), Report.maxY()-18, Report.maxX(), Report.maxY()-18);
        Report.pageNumber({footer: true, align: "right"});
        Report.print("MITRAIS" ,{y: Report.maxY()-14,align: "center"});
        Report.print("Printed: "+(new Date().toLocaleDateString()), {y: Report.maxY()-14, align: "left"});
    };
    
     var headerFunction = function(Report) {
        Report.print("Project List", {fontSize: 22, bold: true, underline:true, align: "center"});
        Report.newLine(2);
    };
        //generate unique ID
        var reportName = uuid.v1();

        var rptName = 'storages/' + userId + '/report/' + reportName + '.pdf';

        var resultReport = new Report(rptName)
            .data(generatedData);
            
        // Settings
        resultReport
            .fontsize(9)
            .margins(50)
            .detail(detail)
            .pageHeader( headerFunction )  
            .pageFooter(footerFunction)  
            .header(header, { pageBreakBefore: false })
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

    Project.remoteMethod(
        'export',
        {
            description: 'export a file to web service',
            accepts: [
                { arg: 'Objects', type: 'object', required: true, http: { source: 'body' } }],

            http: { verb: 'post' }
        }
        );

    Project.remoteMethod(
        'generate',
        {
            description: 'generate PDF file',
            accepts: [
                { arg: 'Objects', type: 'object', required: true, http: { source: 'body' } }],

            http: { verb: 'post' }
        }
        );
};
