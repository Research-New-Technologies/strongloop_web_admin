module.exports = function (Member) {
    var loopback = require('../../node_modules/loopback/lib/loopback');
    var memberModel = this.constructor;
    var app = Member.app;
    var app_root = require('../../server/server');
    //send verification email after registration
    Member.afterRemote('create', function (context, user, next) {
        var options = {
            type: 'email',
            to: user.email,
            from: 'noreply@loopback.com',
            subject: 'Thanks for registering.',
            redirect: '/',
            user: user,
        };
      console.log("====================================")
        user.verify(options, function (err, response) {
            if (err) return next(err);
            next();
        });
    });

    //send error response when login proccess is failed
    Member.afterRemoteError('login', function (context, next) {
        delete context.error.stack;
        if (context.error.code == 'LOGIN_FAILED_EMAIL_NOT_VERIFIED') {
            context.error.message = "Please verify your email before login"
            context = context.error;
            next();
        }
        else {
            Member.find({ where: { email: context.req.body.email } }, function (err, user) {
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


    //delete unused information on reset password response
    Member.afterRemoteError('resetPassword', function (context, next) {
        delete context.error.stack;
        context = context.error;
        next();
    });


    Member.beforeRemote('create', function (context, user, next) {
        //  console.log(context.req.body)
        // console.log(context.req.accessToken)
        
        var AccessToken = app_root.models.AccessToken;
        var RoleMember = app_root.models.roleMember;
        var RoleMapping = app_root.models.RoleMappingMember;
        AccessToken.findForRequest(context.req, {}, function (aux, accessToken) {
            console.log(aux, accessToken)
            if (accessToken == undefined) {
                next();
            }
            else {
    
                //create admin role, skip if already created
                RoleMember.find({where:{ name: 'admin' }}, function (err, role) {
                    var role_admin = role[0];
                    var userRequest = context.req.body;
                    console.log(userRequest)
                    userRequest.emailVerified = false;
                    role_admin.members.create(userRequest, function (err, user) {
                        if (err) {
                            // console.log(err)
                         
                            var error = new Error();
                            error.name = 'CONFLICT'
                            error.status = 409;
                            error.message = 'Email or Username already exist';
                            error.code = 'EMAIL_USERNAME_EXIST';
                            next(error)
                        }
                        else {
                            var tokenGenerator = Member.generateVerificationToken;
                            tokenGenerator(user, function (err, token) {
                                if (err) { }
                                else {
                                    user.verificationToken = token;
                                    user.save(function (err) {
                                    });
                                }

                                RoleMapping.find({ where: { roleId: role.id, memberId: user.id } }, function (err, roleMapping) {
                                    roleMapping[0].principalType = RoleMapping.USER,
                                    roleMapping[0].principalId = user.id;
                                    roleMapping[0].save(function (err) {
                                        if(err){
                                            
                                        }
                                        else {
                                            return context.res.sendStatus(202);
                                        }
                                    });
                                })
                            });
                        }
                    });

                })
            }
            },
            function (error) {
                console.log(error)
            })
    })
    
  

//reset the user's pasword
Member.beforeRemote('resetPassword', function (context, user, next) {
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

        Member.findById(context.req.body.id, function (err, user) {
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
  
//send password reset link when requested
Member.on('resetPasswordRequest', function (info) {
    var host = (Member.app && Member.app.settings.host) || 'localhost';
    var port = (Member.app && Member.app.settings.port) || 3000;
    console.log(Member.app.settings.host)
    var url = host + ':' + port + '/#/reset-password';
    console.log(url)
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

function get_role(user, id) {
    var Role = app_root.models.Role;
    return Role.findById(id, function (err, response) {
        var user_object = user.toObject();
        user_object.role = response.name;
        return user_object;
    });
}

function get_role_mapping(user) {
    var RoleMapping = app_root.models.RoleMapping;
    return RoleMapping.find({ where: { principalId: user.id }, include: 'Role' }, function (err, response) {
        if (response.length == 0) {
            return user
        }
        else {
            return get_role(user, response[0].roleId);
        }
    });
}
    
    
    

// role.members.create({ username: 'admin', email: 'admin@gmail.com', first_name: 'admin', password: 'password', emailVerified: true }, function (err, user) {
//                     if (err) {
//                         console.log("admin already created")
//                     }
//                     else {
//                         var tokenGenerator = Member.generateVerificationToken;
//                         tokenGenerator(user, function (err, token) {
//                             if (err) { }
//                             else {
//                                 user.verificationToken = token;
//                                 user.save(function (err) {
//                                 });
//                             }

//                             RoleMapping.find({ where: { roleId: role.id, memberId: user.id } }, function (err, roleMapping) {
//                                 roleMapping[0].principalType = RoleMapping.USER,
//                                 roleMapping[0].principalId = user.id;
//                                 roleMapping[0].save(function (err) {
//                                 });
//                             })
//                         });
//                     }
//                 });


};





