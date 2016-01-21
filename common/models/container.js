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
    
    Container.beforeRemote('getFiles', function(context, member, next){
        var AccessToken = appRoot.models.AccessToken;
        //check whether access token is valid or not
        console.log(context.req.headers)
        if(context.req.headers.profile_picture) {
            
        }
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
    
      Container.afterRemote('upload', function (context, entity, next) {
          // TODO: Get pricture_type from header
        console.log(entity.result.files.data)  
        console.log(context.req.params.container)
        console.log(context.req.headers.picture_type)
        var Member = appRoot.models.member;
        if(context.req.headers.picture_type == "profile picture"){
            Member.findById(context.req.params.container, function(err, member){
                if(typeof(member.pictures) == 'undefined'){
                    member.pictures = [];
                }
                
               
                entity.result.files.data.forEach(function(data){
                    var picture = {};
                picture.name = data.name;
                picture.type = context.req.headers.picture_type;
                Member.push(picture);
                Member.save(function (err) { 
                });
                });
            });
        }
      })
};
