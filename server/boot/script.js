/* global verificationToken */
module.exports = function (app) {
    var user = app.models.user;
    var role = app.models.Role;
    var roleMapping = app.models.RoleMapping;
    var fs = require('fs')
    var path = require('path');
    
    //create a relation from roleMapping to user
    roleMapping.belongsTo(user, { foreignKey: 'principalId' });
    
    //create a relation from roleMapping to role
    roleMapping.belongsTo(role, { foreignKey: 'roleId' });

    //create admin role, skip if already created
    role.find(function (err, roleAdminResults) {
        
        //when there is no any role, then create the default admin and member user
        if (roleAdminResults.length == 0) {
      
            //create a admin role
            role.create({
                name: 'admin'
            }, function (err, roleResult) {
                if (err) return err;
                
                //create a default admin user
                user.create({
                    username: 'admin',
                    email: 'admin@admin.com',
                    firstName: 'admin',
                    lastName: 'admin',
                    dateOfBirth: new Date(),
                    createdDate: new Date(),
                    lastUpdated: new Date(),
                    phoneNumber: '0000000',
                    address: 'current address',
                    lastLogin: new Date(),
                    password: 'password',
                    emailVerified: true,
                    profilePicture: 'storages/missing/missing-image.png'
                }, function (err, userResult) {
                    if (err) {
                    }
                    else {
                        //make admin user as an admin
                        roleResult.principals.create({
                            principalType: roleMapping.USER,
                            principalId: userResult.id
                        }, function (err, principalResult) {

                        })
                    }
                });
            });
            
            //create a member role
            role.create({
                name: 'member'
            }, function (err, roleResult) {
                
                //create a default member user
                user.create({
                    username: 'member',
                    email: 'member@member.com',
                    first_name: 'member',
                    lastName: 'admin',
                    dateOfBirth: new Date(),
                    createdDate: new Date(),
                    lastUpdated: new Date(),
                    phoneNumber: '0000000',
                    address: 'current address',
                    lastLogin: new Date(),
                    password: 'password',
                    emailVerified: true,
                    profilePicture: 'storages/missing/missing-image.png'
                }, function (err, userResult) {
                    if (err) {

                    }
                    else {
                        //make member user as a member
                        roleResult.principals.create({
                            principalType: roleMapping.USER,
                            principalId: userResult.id
                        }, function (err, principalResult) {

                        })
                    }
                });
            });
        }
    })
    
    //crete 'storages folder if it doesn't exist
    if (!fs.existsSync('storages')) {
        fs.mkdirSync('storages', function (err) {
        });
    }
};