module.exports = function (user) {
    var loopBack = require('../../node_modules/loopback/lib/loopback');
    var app = require('../../server/server');
    
    
    //check whether the request is from Admin or unauthenticated member.
    user.beforeRemote('create', function (context, userInstance, next) {
        context.req.body.createdDate = new Date();
        context.req.body.lastUpdated = new Date();
        if(typeof(context.req.body.profilePicture) == 'undefined'){
            context.req.body.profilePicture = 'storages/missing/missing-image.png';
        }
        var error = new Error();
        if (typeof (context.req.body.username) == 'undefined' || context.req.body.username == '') {
            error.name = 'BAD_REQUEST'
            error.status = 400;
            error.message = 'Username is empty';
            error.code = 'USERNAME_IS_EMPTY';
            return next(error)
        }
        else if (context.req.body.password != context.req.body.confirmPassword) {
            error.name = 'BAD_REQUEST'
            error.status = 400;
            error.message = "Confirm password doesn't match";
            error.code = 'USERNAME_IS_EMPTY';
            return next(error)
        }
        else {
            user.find({ where: { 'email': context.req.body.email } }, function (err, userResults) {
                if (userResults.length == 1) {
                    if (!userResults[0].emailVerified) {
                        var createdTime = userResults[0].createdDate.getTime();
                        var currentTime = new Date().getTime();
                        var time_range_in_minutes = (currentTime - createdTime) / 60000;
                        if (time_range_in_minutes >= user.app.settings.repeatedSignupInterval) {
                            user.destroyById(userResults[0].__data.id, function (err, res) {
                                app.models.RoleMapping.find({ where: { 'userId': userResults[0].__data.id } }, function (err, roleMappingResults) {
                                    roleMappingResults.forEach(function (roleMappingObject) {
                                        roleMappingObject.remove();
                                    })
                                    next();
                                });
                            })
                        }

                        else {
                            var interval = (Math.round(user.app.settings.repeatedSignupInterval - time_range_in_minutes));
                            if (interval == 0) {
                                interval = 1;
                            }
                            var error = new Error();
                            error.name = '412'
                            error.status = 400;
                            error.message = 'Please sign up in next ' + interval + ' minutes';
                            error.code = 'RE_SIGNUP_ERROR';
                            return next(error)
                        }
                    }
                    else {
                        next();
                    }
                }
                else {
                    //define object model
                    var accessToken = app.models.AccessToken;
                    var role = app.models.Role;
                    var roleMapping = app.models.RoleMapping;
        
                    //check whether access token is valid or not
                    accessToken.findForRequest(context.req, {}, function (aux, accessTokenResult) {
                        //request is from unauthenticated member
                        if (typeof (accessTokenResult) == 'undefined') {
                            next();
                        }
            
                        //request is from authenticated member
                        else {
                            //retrive role admin object
                            role.find({ where: { name: 'admin' } }, function (err, roleResults) {
                                var roleAdmin = roleResults[0];
                                //check whether there is role mapping from memberId and role admin id
                                roleMapping.find({ where: { principalId: context.req.accessToken.userId, roleId: roleAdmin.id } }, function (err, roleMappingResults) {
                                    //if the request from admin user
                                    if (roleMappingResults.length > 0) {
                                        var userRequest = context.req.body;
                                        userRequest.createdDate = new Date();
                                        user.lastUpdated = new Date();
                                        userRequest.emailVerified = true;
                                
                                        //create a new admin
                                        user.create(userRequest, function (err, userResult) {
                                            //error occured when create a new admin
                                            if (err) {
                                                var error = new Error();
                                                error.name = 'CONFLICT'
                                                error.status = 409;
                                                error.message = 'Email or Username already exist';
                                                error.code = 'EMAIL_USERNAME_EXIST';
                                                next(error)
                                            }
                                
                                            //successfully create a new admin
                                            else {
                                                roleAdmin.principals.create({
                                                    principalType: roleMapping.USER,
                                                    principalId: userResult.id
                                                }, function (err, principal) {
                                                    if (err) {
                                                        return next(err);
                                                    }
                                                    return context.res.sendStatus(202);
                                                })
                                            }
                                        });
                                    }
                        
                                    //role mapping with adminId and roleId Admin not found
                                    else {
                                        next();
                                    }
                                })
                            })
                        }
                    },
                        function (error) {
                            console.log(error)
                        })
                }
            })
        }
    })
    
    //send verification email after registration
    user.afterRemote('create', function (context, userInstance, next) {
        //retrive role admin object
        app.models.Role.find({ where: { name: 'member' } }, function (err, roleResults) {
            var roleObject = roleResults[0];
            //create a new admin member
            app.models.RoleMapping.create({ principalType: 'USER', principalId: userInstance.id, roleId: roleObject.id }, function (err, roleMappingResult) {
                var options = {
                    type: 'email',
                    to: userInstance.email,
                    from: 'noreply@loopback.com',
                    subject: 'Thanks for registering.',
                    redirect: encodeURIComponent('/#/confirmation'),
                    user: userInstance,
                };
                userInstance.verify(options, function (err, response) {
                    if (err) return next(err);
                    next();
                });
            })
        })
    });
    
    //redirect to error page when confirm email is invalid
    user.afterRemoteError('confirm', function (context, userInstance, next) {
        user.findById(context.req.query.uid, function (err, userResult) {
            if (userResult) {
                if (userResult.__data.emailVerified) {
                    context.res.redirect('/#/member-confirm-email-verified');
                    context.res.end();
                }
                else {
                    context.res.redirect('/#/member-confirm-error');
                    context.res.end();
                }
            }

            else {
                context.res.redirect('/#/member-confirm-error');
                context.res.end();
            }
        });
    })
       
    //send error response when login proccess is failed
    user.afterRemoteError('login', function (context, next) {
        delete context.error.stack;
        if (context.error.code == 'LOGIN_FAILED_EMAIL_NOT_VERIFIED') {
            context.error.message = "Please verify your email before login"
            context = context.error;
            next();
        }
        else {
            user.find({ where: { email: context.req.body.email } }, function (err, userResults) {
                if (userResults.length == 0) {
                    context.error.message = "Login failed, " + context.req.body.email + " is not registered";
                }
                else {
                    context.error.message = "Login failed, please enter a valid password";
                }
                context = context.error;
                next();
            })
        }
    });

    //when user has successfully logged, then add role name & profile picture
    user.afterRemote('login', function (context, userInstance, next) {
        user.findById(context.result.__data.userId, { include: { relation: 'roleMapping', scope: { include: { relation: 'role' } } } }, function (err, userResult) {
            if (userResult != null) {
                var host = (user.app && user.app.settings.host);
                var port = (user.app && user.app.settings.port);
                context.result.__data.user = userResult.__data;
                context.result.__data.user.roleName = userResult.__data.roleMapping[0].__data.role.name;
                context.result.__data.user.profilePicture = 'http://'+host+':'+port+'/'+userResult.profilePicture;
                next();
            }
        })
    })
    
    //delete unused information on reset password response
    user.afterRemoteError('resetPassword', function (context, next) {
        delete context.error.stack;
        context = context.error;
        next();
    });

    //reset the user's pasword
    user.beforeRemote('resetPassword', function (context, userInstance, next) {
        if (context.req.body.password) {
            if (!context.req.headers.accessToken) return context.res.sendStatus(401);
      
            //verify passwords match
            if (!context.req.body.password ||
                !context.req.body.confirmPassword ||
                context.req.body.password !== context.req.body.confirmPassword) {

                var error = new Error();
                error.name = 'BAD_REQUEST'
                error.status = 400;
                error.message = 'Passwords do not match';
                error.code = 'PASSWORDS_DO_NOT_MATCH';
                return next(error)
            }

            user.findById(context.req.body.id, function (err, userResult) {
                if (err) return context.res.sendStatus(404);
                userResult.updateAttribute('password', context.req.body.password, function (err, userUpdateResult) {
                    if (err) return context.res.sendStatus(404);
                    console.log('> password reset processed successfully');
                    return context.res.sendStatus(202);
                });
            });
        }
        else {
            next();
        }
    });
    
    
    //remote method - find users
    user.beforeRemote('find', function (context, userInstance, next) {
        var queryFilter = JSON.parse(context.req.query.filter);
        var roleMapping = app.models.RoleMapping;
        var results = [];
        
        //check if the query filter is roleId, then prevent to next, do query and return the results
        if (queryFilter.order == "roleId DESC" || queryFilter.order == "roleId ASC") {
            //use "include ['user','role'] to add user and role object into roleMapping"
            roleMapping.find({ limit: queryFilter.limit, skip: queryFilter.skip, order: queryFilter.order, include: ['user', 'role'] }, function (err, roleMappingResults) {
                roleMappingResults.forEach(function (element, index, array) {
                    var user = element.__data.user.__data;
                    user.role_name = element.__data.role.__data.name;
                    results.push(user)
                    if (index == roleMappingResults.length - 1) {
                        return context.res.status(200).send(results);
                    }
                });
            });
        }
        //when query filter is not roleId, pass it
        else {
            next();
        }
    })
    
    //find users
    user.afterRemote('find', function (context, userInstance, next) {
        var results = [];
        var host = (user.app && user.app.settings.host);
        var port = (user.app && user.app.settings.port);
        context.result.forEach(function (result) {
            user.findById(result.__data.id, { include: ['media', { relation: 'roleMapping', scope: { include: { relation: 'role' } } }] }, function (err, userResult) {
                result.__data.role_name = userResult.__data.roleMapping[0].__data.role.name;
                result.__data.profilePicture = 'http://'+host+':'+port+'/'+result.__data.profilePicture;
                results.push(result);
                if (results.length == context.result.length) {
                    context.result = results;
                    next();
                }

            })
        })
    })
  
    //send password reset link when requested
    user.on('resetPasswordRequest', function (info) {
        var host = (user.app && user.app.settings.host);
        var port = (user.app && user.app.settings.port);
        var url = host + ':' + port + '/#/reset-password';
        var html = 'Click <a href="http://' + url + '?password=' +
            info.user.password + '&token=' + info.accessToken.id + '&email=' + info.user.email + '&id=' + info.user.id + '">here</a> to reset your password';

        var options = {
            type: 'email',
            to: info.email,
            from: '',
            subject: 'Reset Password Request',
            html: html
        };

        var Email = options.mailer || this.constructor.email || loopBack.getModelByType(loopBack.Email);
        options.headers = options.headers || {};

        Email.send(options, function (err, email) {
            if (err) {
                console.log(err)
            } else {
                console.log("message sent")
            }
        });
    });
};





