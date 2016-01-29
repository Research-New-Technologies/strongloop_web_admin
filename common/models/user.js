module.exports = function (User) {
    var loopback = require('../../node_modules/loopback/lib/loopback');
    var appRoot = require('../../server/server');
    
    //send verification email after registration
    User.afterRemote('create', function (context, user, next) {
        //retrive role admin object
        appRoot.models.Role.find({ where: { name: 'member' } }, function (err, role) {
            var roleObject = role[0];
            //create a new admin member
            appRoot.models.RoleMapping.create({ principalType: 'USER', principalId: user.id, roleId: roleObject.id }, function (err, member) {
                var options = {
                    type: 'email',
                    to: user.email,
                    from: 'noreply@loopback.com',
                    subject: 'Thanks for registering.',
                    redirect: encodeURIComponent('/#/confirmation'),
                    user: user,
                };
                user.verify(options, function (err, response) {
                    if (err) return next(err);
                    next();
                });
            })
        })
    });
    
    //redirect to error page when confirm email is invalid
    User.afterRemoteError('confirm', function (context, user, next) {
        User.findById(context.req.query.uid, function (err, user) {
            if (user) {
                if (user.__data.emailVerified) {
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
    
    //redirect to success page when confirm email is success
    User.afterRemote('confirm', function (context, user, next) {
        var Container = appRoot.models.container;
        Container.createContainer({ name: context.req.query.uid }, function (err, c) {
            next();
        });
    })
    
    //send error response when login proccess is failed
    User.afterRemoteError('login', function (context, next) {
        delete context.error.stack;
        if (context.error.code == 'LOGIN_FAILED_EMAIL_NOT_VERIFIED') {
            context.error.message = "Please verify your email before login"
            context = context.error;
            next();
        }
        else {
            User.find({ where: { email: context.req.body.email } }, function (err, user) {
                if (user.length == 0) {
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

    User.afterRemote('login', function (context, user, next) {
        User.findById(context.result.__data.userId, { include: { relation: 'roleMapping', scope: { include: { relation: 'role' } } } }, function (err, user) {
            context.result.__data.first_name = user.first_name;
            context.result.__data.last_name = user.last_name;
            context.result.__data.dob = user.dob;
            context.result.__data.username = user.username;
            context.result.__data.role_name = user.__data.roleMapping[0].__data.role.name;
            next();
        })

    })
    
    //delete unused information on reset password response
    User.afterRemoteError('resetPassword', function (context, next) {
        delete context.error.stack;
        context = context.error;
        next();
    });


    //check whether the request is from Admin or unauthenticated member.
    User.beforeRemote('create', function (context, user, next) {
        context.req.body.created_date = new Date();
        if (typeof (context.req.body.username) == 'undefined' || context.req.body.username == '') {
            var error = new Error();
            error.name = 'BAD_REQUEST'
            error.status = 400;
            error.message = 'Username is empty';
            error.code = 'USERNAME_IS_EMPTY';
            return next(error)
        }
        else {
            User.find({ where: { 'email': context.req.body.email } }, function (err, users) {
                if (users.length == 1) {
                    if (!users[0].emailVerified) {
                        var created_time = users[0].created_date.getTime();
                        var current_time = new Date().getTime();
                        var time_range_in_minutes = (current_time - created_time) / 60000;
                        if (time_range_in_minutes >= User.app.settings.repeated_signup_interval) {
                            User.destroyById(users[0].__data.id, function (err, res) {
                                appRoot.models.RoleMapping.find({ where: { 'userId': users[0].__data.id } }, function (err, roleMappings) {
                                    roleMappings.forEach(function (roleMappingObject) {
                                        roleMappingObject.remove();
                                    })
                                    next();
                                });
                            })
                        }

                        else {
                            var interval = (Math.round(User.app.settings.repeated_signup_interval - time_range_in_minutes));
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
                    var AccessToken = appRoot.models.AccessToken;
                    var Role = appRoot.models.Role;
                    var RoleMapping = appRoot.models.RoleMapping;
        
                    //check whether access token is valid or not
                    AccessToken.findForRequest(context.req, {}, function (aux, accessToken) {
                        //request is from unauthenticated member
                        if (typeof (accessToken) == 'undefined') {
                            next();
                        }
            
                        //request is from authenticated member
                        else {
                            //retrive role admin object
                            Role.find({ where: { name: 'admin' } }, function (err, role) {
                                var roleAdmin = role[0];

                                //check whether there is role mapping from memberId and role admin id
                                RoleMapping.find({ where: { principalId: context.req.accessToken.userId, roleId: roleAdmin.id } }, function (err, roleMappings) {
                                    //if the request from admin user
                                    if (roleMappings.length > 0) {
                                        var userRequest = context.req.body;
                                        userRequest.emailVerified = true;
                            
                                        //create a new admin
                                        User.create(userRequest, function (err, admin) {
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
                                                    principalType: RoleMapping.USER,
                                                    principalId: admin.id
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

    //reset the user's pasword
    User.beforeRemote('resetPassword', function (context, user, next) {
        if (context.req.body.password) {
            if (!context.req.headers.access_token) return context.res.sendStatus(401);
      
            //verify passwords match
            if (!context.req.body.password ||
                !context.req.body.password_confirmation ||
                context.req.body.password !== context.req.body.password_confirmation) {

                var error = new Error();
                error.name = 'BAD_REQUEST'
                error.status = 400;
                error.message = 'Passwords do not match';
                error.code = 'PASSWORDS_DO_NOT_MATCH';
                return next(error)
            }

            User.findById(context.req.body.id, function (err, user) {
                if (err) return context.res.sendStatus(404);
                user.updateAttribute('password', context.req.body.password, function (err, user) {
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
    User.beforeRemote('find', function (context, user, next) {
        var queryFilter = JSON.parse(context.req.query.filter);
        var RoleMapping = appRoot.models.RoleMapping;
        var results = [];
        
        //check if the query filter is roleId, then prevent to next, do query and return the results
        if (queryFilter.order == "roleId DESC" || queryFilter.order == "roleId ASC") {
            //use "include ['user','role'] to add user and role object into roleMapping"
            RoleMapping.find({ limit: queryFilter.limit, skip: queryFilter.skip, order: queryFilter.order, include: ['user', 'role'] }, function (err, roleMappings) {
                roleMappings.forEach(function (element, index, array) {
                    var user = element.__data.user.__data;
                    user.role_name = element.__data.role.__data.name;
                    results.push(user)
                    if (index == roleMappings.length - 1) {
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
    User.afterRemote('find', function (context, user, next) {
        var results = [];
        context.result.forEach(function (result) {
            User.findById(result.__data.id, { include: { relation: 'roleMapping', scope: { include: { relation: 'role' } } } }, function (err, users) {
                result.__data.role_name = users.__data.roleMapping[0].__data.role.name;
                results.push(result);
                if (results.length == context.result.length) {
                    context.result = results;
                    next();
                }

            })
        })
    })
  
    //send password reset link when requested
    User.on('resetPasswordRequest', function (info) {
        var host = (User.app && User.app.settings.host) || 'localhost';
        var port = (User.app && User.app.settings.port) || 3000;
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

        var Email = options.mailer || this.constructor.email || loopback.getModelByType(loopback.Email);
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





