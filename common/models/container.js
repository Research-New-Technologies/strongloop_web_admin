module.exports = function (Container) {


    var appRoot = require('../../server/server');
    var AccessToken = appRoot.models.AccessToken;


    Container.beforeRemote('upload', function (context, member, next) {
        var AccessToken = appRoot.models.AccessToken;
      
        //check whether access token is valid or not
        AccessToken.findById(context.req.headers.access_token, function (err, token) {
            if (err) {
                var error = new Error();
                error.name = 'Bad Request'
                error.status = 400;
                error.message = 'BAD REQUEST';
                error.code = 'BAD REQUEST';
                return next(error)
            } else if (token) {
                token.validate(function (err, isValid) {
                    if (err) {
                        next();
                    }

                    else if (isValid) {
                        if (context.req.params.container == token.userId) {
                            next();
                        }
                        else {
                            var error = new Error();
                            error.name = 'Bad Request'
                            error.status = 400;
                            error.message = 'Invalid URL';
                            error.code = 'INVALID_URL';
                            return next(error)
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
        });

    })

    Container.beforeRemote('download', function (context, member, next) {
        var AccessToken = appRoot.models.AccessToken;
        //check whether access token is valid or not
        AccessToken.findById(context.req.headers.access_token, function (err, token) {
            if (token != null) {
                token.validate(function (err, isValid) {
                    console.log(isValid)
                    if (err) {
                        var error = new Error();
                        error.name = 'Unauthorized'
                        error.status = 401;
                        error.message = 'Invalid Access Token';
                        error.code = 'INVALID_TOKEN';
                        return next(error)
                    }

                    else if (isValid) {
                        if (context.req.params.container == token.userId) {
                            next();
                        }
                        else {
                            var error = new Error();
                            error.name = 'Bad Request'
                            error.status = 400;
                            error.message = 'Invalid URL';
                            error.code = 'INVALID_URL';
                            return next(error)
                        }

                    }
                })
            }
            else {
                console.log(context.req.params)
                var error = new Error();
                error.name = 'Unauthorized'
                error.status = 401;
                error.message = 'Invalid Access Token';
                error.code = 'INVALID_TOKEN';
                next(error)
            }
        });
    })

    Container.afterRemote('upload', function (context, entity, next) {
        // TODO: Get pricture_type from header
        var Member = appRoot.models.member;
        if (context.req.headers.picture_type == "profile picture") {
            Member.findById(context.req.params.container, function (err, member) {
                if (typeof (member.pictures) == 'undefined') {
                    member.pictures = [];
                }
                else {
                    for (var i = 0; i < member.pictures.length; i++) {
                        if (member.pictures[i].type == 'profile picture') {
                            Container.removeFile(context.req.params.container, member.pictures[i].name, function (err) {
                                member.pictures[i] = undefined;
                                member.save(function (err) {

                                });
                            })
                        }
                    }
                }
                member.pictures = [];
                var picture = {};
                picture.name = entity.result.files.data[0].name;
                picture.type = context.req.headers.picture_type;
                member.pictures.push(picture);
                member.save(function (err) {
                    next();
                });
            });
        }
    })

};
