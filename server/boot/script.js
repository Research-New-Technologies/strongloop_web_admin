/* global verificationToken */
module.exports = function (app) {
    var Member = app.models.member;
    var Role = app.models.roleMember;
    var RoleMapping = app.models.roleMappingMember;
    
    //create admin role, skip if already created
    Role.find({ name: 'admin' }, function (err, response) {
        if (response.length > 0) {
            console.log(response)
        }
        else {
            Role.create({
                name: 'admin'
            }, function (err, role) {
                if (err) throw err;
                
                role.members.create({ username: 'admin', email: 'admin@admin.com', first_name: 'admin', password: 'password', emailVerified: true }, function (err, user) {
                    if (err) {
                        console.log("admin already created")
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
                                });
                            })
                        });
                    }
                });
                
               
            });

            Role.create({
                name: 'member'
            }, function (err, role) {
                 role.members.create({ username: 'member', email: 'member@member.com', first_name: 'member', password: 'password', emailVerified: true }, function (err, user) {
                    if (err) {
                        console.log("member already created")
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
                                });
                            })
                        });
                    }
                });
            });
        }
    })
};