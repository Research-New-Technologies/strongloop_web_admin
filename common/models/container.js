module.exports = function (Container) {
    var appRoot = require('../../server/server');
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
};
