module.exports = function (Media) {
    var appRoot = require('../../server/server');
    var uuid = require('node-uuid');
    var fs = require('fs');
    
    
    // Decoding base-64 image
    function decodeBase64Image(dataString) {
        var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        var response = {};

        if (matches == null || matches.length !== 3) {
            return null;
        }

        var fileType = matches[1].split('/');
        response.type = fileType[0];
        response.format = '.' + fileType[1];
        response.data = new Buffer(matches[2], 'base64');
        console.log(response.data)
        return response;
    }


    //upload file
    Media.beforeRemote('create', function (context, mediaInstance, next) {
        var accessToken = appRoot.models.AccessToken;

        var roleMapping = appRoot.models.RoleMapping;
        //check whether access token is valid or not
        accessToken.findById(context.req.headers.authorization, function (err, accessTokenResult) {
            if (accessTokenResult != null) {
                var accessTokenRes = accessTokenResult;
                accessTokenResult.validate(function (err, isValid) {
                    if (isValid) {

                        if (accessTokenRes.__data.userId == context.req.body.userId) {
                            Media.saveFile(context, next);
                        }
                        else {
                            roleMapping.find(
                                { include: { relation: 'role' }, where: { principalId: accessTokenRes.__data.userId } }, function (err, roleMappingResults) {
                                    if (roleMappingResults[0].__data.role.__data.name == 'admin') {
                                        Media.saveFile(context, next);
                                    }
                                    else {
                                        var error = new Error();
                                        error.name = 'Unauthorized'
                                        error.status = 401;
                                        error.message = 'Invalid Access Token';
                                        error.code = 'INVALID_TOKEN';
                                        return next(error)
                                    }
                                })
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
    })

    Media.saveFile = function (context, next) {
        var userId = context.req.body.userId;
        var user = appRoot.models.user;
        //check directory is exist or not
        if (!fs.existsSync('storages/' + userId)) {
            fs.mkdirSync('storages/' + userId, function (err) {
                console.log(err)
            });
        }
                        
        //convert req body data to image
        var data = decodeBase64Image(context.req.body.data);
        
        if(data == null){
           var error = new Error();
                error.name = 'BAD_REQUEST'
                error.status = 400;
                error.message = 'Picture is not valid';
                error.code = 'PICTURE_IS_NOT_VALID';
                return next(error)
        }                
        //generate unique ID
        var name = uuid.v1();
                        
        //save file into storage
        fs.writeFile('storages/' + userId + '/' + name + data.format, data.data, function (err) {
            if (err) return console.log(err);
            var media = {};
            media.url = 'storages/' + userId + '/' + name + data.format;
            media.userId = userId;
            media.type = data.type;
            media.format = data.format;
            media.dateCreated = new Date();
                            
            //save file information into database
            Media.create(media, function (err, res) {
                if (context.req.body.isProfilePicture) {
                    user.findById(userId, function (err, userObject) {
                        userObject.profilePicture = 'storages/' + userId + '/' + name + data.format;
                        userObject.save();

                        var response = {};
                        response.message = "Image has Successfully uploaded";
                        response.image_url = userObject.profilePicture;
                        response.id = userObject.id;

                        return context.res.status(200).send(response);
                    })
                }
                else {
                    var response = {};
                    response.message = "Image has Successfully uploaded";
                    response.image_url = res.url;
                    response.id = userId;

                    return context.res.status(200).send(response);
                }
            });
        })
    }
};
