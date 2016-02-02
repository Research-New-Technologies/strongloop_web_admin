module.exports = function (Media) {
    var appRoot = require('../../server/server');
    var uuid = require('node-uuid');
    var fs = require('fs');
    
    
    // Decoding base-64 image
    function decodeBase64Image(dataString) {
        var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        var response = {};

        if (matches.length !== 3) {
            return new Error('Invalid input string');
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
        var AccessToken = appRoot.models.AccessToken;
        var User = appRoot.models.user;
        var userId = {};
        
        //check whether access token is valid or not
        AccessToken.findById(context.req.query.access_token, function (err, token) {
            if (token != null) {
                userId = token.userId;
                token.validate(function (err, isValid) {
                    if (isValid) {
                        //check directory is exist or not
                        if (!fs.existsSync('storages/' + userId)) {
                            fs.mkdirSync('storages/' + userId, function (err) {
                                console.log(err)
                            });
                        }
                        
                        //convert req body data to image
                        var data = decodeBase64Image(context.req.body.data);
                        
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
                                    User.findById(userId, function (err, userObject) {
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
};
