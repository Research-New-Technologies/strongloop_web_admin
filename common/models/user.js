module.exports = function (user) {
    var loopBack = require('../../node_modules/loopback/lib/loopback');
    var app = require('../../server/server');
    
    //check whether the request is from Admin or unauthenticated member.
    user.beforeRemote('create', function (context, userInstance, next) {
        
        //define object model
        var accessToken = app.models.AccessToken;
        var role = app.models.Role;
        var roleMapping = app.models.RoleMapping;
        
        //add created date and last updated  with current date to the request body.
        context.req.body.createdDate = new Date();
        context.req.body.lastUpdated = new Date();
        
        //when request body doesn't have profilePicture, then set it to default profile picture
        if (typeof (context.req.body.profilePicture) == 'undefined') {
            context.req.body.profilePicture = 'storages/missing/missing-image.png';
        }
        
        //create a new error variable and it will used later
        var error = new Error();
        
        //when there is no username property in the request body then return BAD REQUEST error
        if (typeof (context.req.body.username) == 'undefined' || context.req.body.username == '') {
            error.name = 'BAD_REQUEST'
            error.status = 400;
            error.message = 'Username is empty';
            error.code = 'USERNAME_IS_EMPTY';
            return next(error)
        }
        
        //when password and confirm password don't match then return BAD request error
        else if (context.req.body.password != context.req.body.confirmPassword) {
            error.name = 'BAD_REQUEST'
            error.status = 400;
            error.message = "Confirm password doesn't match";
            error.code = 'USERNAME_IS_EMPTY';
            return next(error)
        }
        
        //when request body is acceptable
        else {
            
            //check whether there is a user with same email with request body email 
            user.find({ where: { 'email': context.req.body.email } }, function (err, userResults) {
                
                //if there is a user with same email
                if (userResults.length == 1) {
                    
                    //check whether email already verified or not
                    if (!userResults[0].emailVerified) {
                        
                        //when it doesn't verified  
                        //retrieve the created time of the current user
                        var createdTime = userResults[0].createdDate.getTime();
                        
                        //get current time
                        var currentTime = new Date().getTime();
                        
                        //get the difference between current time and created time and convert it into minutes
                        var time_range_in_minutes = (currentTime - createdTime) / 60000;
                        
                        //check whether the difference time is bigger than determined interval in config.json
                        if (time_range_in_minutes >= user.app.settings.repeatedSignupInterval) {
                            
                            //when the difference is bigger, then do destroy user
                            user.destroyById(userResults[0].__data.id, function (err, res) {
                                
                                //after destroy user, do find roleMapping object based on destroyed user id
                                app.models.RoleMapping.find({ where: { 'userId': userResults[0].__data.id } }, function (err, roleMappingResults) {
                                    
                                    //when it has roleMapping, then looping into every items
                                    roleMappingResults.forEach(function (roleMappingObject) {
                                        
                                        //remove roleMapping object from database
                                        roleMappingObject.remove();
                                    })
                                    
                                    //delete current user & current role mapping has done, then go to default create user
                                    next();
                                });
                            })
                        }
                        
                        //when the diffrence time is smaller than the determined interval
                        else {
                            
                            //calculate difference between determined interval with accumulation time from the created date of current user with the created date of the new user
                            var interval = (Math.round(user.app.settings.repeatedSignupInterval - time_range_in_minutes));
                            
                            //when interval equal zero, then make it as 1
                            if (interval == 0) {
                                interval = 1;
                            }
                            
                            //return an error
                            var error = new Error();
                            error.name = '412'
                            error.status = 400;
                            error.message = 'Please sign up in next ' + interval + ' minutes';
                            error.code = 'RE_SIGNUP_ERROR';
                            return next(error)
                        }
                    }
                    
                    //if the current user already verified their email address, then go to next
                    else {
                        next();
                    }
                }

                //if there is no current user with same email address
                else {
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
                                        
                                        //get request body and add lastUpdated & emailVerified property
                                        var userRequest = context.req.body;
                                        userRequest.createdDate = new Date();
                                        user.lastUpdated = new Date();
                                        userRequest.emailVerified = true;
                                        delete userRequest.confirmPassword;
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
                                                
                                                //create roleMapping from a new admin user
                                                roleAdmin.principals.create({
                                                    principalType: roleMapping.USER,
                                                    principalId: userResult.id
                                                }, function (err, principal) {
                                                    if (err) {
                                                        return next(err);
                                                    }
                                                    return context.res.status(200).send(userResult);
                                                })
                                            }
                                        });
                                    }
                        
                                    //roleMapping with adminId and roleId Admin not found
                                    else {
                                        next();
                                    }
                                })
                            })
                        }
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
                
                //send an email to the new member user
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
        console.log(context.error.stack)
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
                context.result.__data.user.profilePicture = 'http://' + host + ':' + port + '/' + userResult.profilePicture;
                delete context.result.__data.user.password;
                delete context.result.__data.user.roleMapping;
                return context.res.status(200).send(context.result);
            }
        })
    })
    
    //delete unused information on reset password response
    user.afterRemoteError('resetPassword', function (context, next) {
        delete context.error.stack;
        context = context.error;
        next();
    });

    //reset the user's password
    user.beforeRemote('resetPassword', function (context, userInstance, next) {
        var accessToken = app.models.AccessToken;
        //check whether the request body has pssword property
        if (context.req.body.password) {
            //check whether there is accessToken header or not
            if (!context.req.headers.accessToken) return context.res.sendStatus(401);
      
            //verify passwords match then return error if it doesn't match
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

            else {
                //check whether access token is valid or not
                accessToken.findById(context.req.headers.accessToken, function (err, accessTokenResult) {
                    
                    //if the access token already saved in database
                    if (accessTokenResult != null) {
                        
                        //validate access token
                        accessTokenResult.validate(function (err, isValid) {
                            
                            //when access token is valid
                            if (isValid) {
                                
                                //find user by request body user Id
                                user.findById(accessTokenResult.userId, function (err, userResult) {
                                    
                                    //return not found when user with the id not found in database
                                    if (err) return context.res.sendStatus(404);
                                    
                                    //update user password
                                    userResult.updateAttribute('password', context.req.body.password, function (err, userUpdateResult) {
                                        if (err) return context.res.sendStatus(404);
                                        console.log('> password reset processed successfully');
                                        return context.res.sendStatus(200);
                                    });
                                });

                            }
                            
                            //when access token is invalid
                            else {
                                return context.res.sendStatus(401);
                            }
                        })
                    }
                    
                    //when access token is not available in the database
                    else {
                        return context.res.sendStatus(401);
                    }
                })
            }
        }
        else {
            next();
        }
    });
    
    
    
    //remote method - find users
    user.beforeRemote('find', function (context, userInstance, next) {
        
        //get filter query from the request
        var queryFilter = {};
        if (typeof (context.req.query.filter) != 'undefined') {
            queryFilter = JSON.parse(context.req.query.filter);

            var roleMapping = app.models.RoleMapping;
            var results = [];

            var host = (user.app && user.app.settings.host);
            var port = (user.app && user.app.settings.port);
        
            //check if the query filter is roleId, then prevent to next, do query and return the results
            if (queryFilter.order == "roleId DESC" || queryFilter.order == "roleId ASC") {
                //use "include ['user','role'] to add user and role object into roleMapping"
                roleMapping.find({ limit: queryFilter.limit, skip: queryFilter.skip, order: queryFilter.order, include: ['user', 'role'] }, function (err, roleMappingResults) {
                    roleMappingResults.forEach(function (element, index, array) {
                        var user = element.__data.user.__data;
                    
                    //add role name
                    user.roleName = element.__data.role.__data.name;
                    delete user.password;
                    //add profile host and port to profile picture url
                    user.profilePicture = 'http://' + host + ':' + port + '/' + user.profilePicture
                    results.push(user)
                    
                        //when the looping has done
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
        }
        else {
            next();
        }



    })
    
    //find users
    user.afterRemote('find', function (context, userInstance, next) {
        var roleMapping = app.models.RoleMapping;
        var host = (user.app && user.app.settings.host);
        var port = (user.app && user.app.settings.port);
        
        //looping for every item of results
        context.result.forEach(function (result, index, array) {
            delete  result.__data.password;
            //add host and port to the profile picture url
            result.__data.profilePicture = 'http://' + host + ':' + port + '/' + result.__data.profilePicture;
            roleMapping.find({ include: { relation: 'role' }, where: { principalId: result.__data.id } }, function (err, roleMappingResults) {
                if (roleMappingResults.length > 0) {
                    result.__data.roleName = [];
                    roleMappingResults.forEach(function (roleMappingResult) {
                        //add role name
                        
                        result.__data.roleName.push(roleMappingResult.__data.role.__data.name)

                    })
                    
                    //when the looping has done
                    if (index == context.result.length - 1) {
                        next();
                    }
                }
            })
        })
    })
  
    //send password reset link when requested
    user.on('resetPasswordRequest', function (info) {
        
        //get config setting of host & port from config.json
        var host = (user.app && user.app.settings.host);
        var port = (user.app && user.app.settings.port);
        
        //set url of reset password
        var url = host + ':' + port + '/#/reset-password';
        
        //make an email content. This email contains url with parameter hash password, access token, email address & userId
        var html = 'Click <a href="http://' + url + '?password=' +
            info.user.password + '&token=' + info.accessToken.id + '&email=' + info.user.email + '&id=' + info.user.id + '">here</a> to reset your password';
        
        //set the options of the email     
        var options = {
            type: 'email',
            to: info.email,
            from: '',
            subject: 'Reset Password Request',
            html: html
        };

        var Email = options.mailer || this.constructor.email || loopBack.getModelByType(loopBack.Email);
        options.headers = options.headers || {};
        
        //send an email
        Email.send(options, function (err, email) {
            if (err) {
                console.log(err)
            } else {
                console.log("message sent")
            }
        });
    });
};





