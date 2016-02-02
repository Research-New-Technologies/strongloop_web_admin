/* global verificationToken */
module.exports = function (app) {
    var user = app.models.user;
    var role = app.models.Role;
    var roleMapping = app.models.RoleMapping;
    var fs = require('fs')
    var path = require('path');
    roleMapping.belongsTo(user, { foreignKey: 'principalId' });
    roleMapping.belongsTo(role, { foreignKey: 'roleId' });

    //create admin role, skip if already created
    role.find({ name: 'admin' }, function (err, roleAdminResults) {
        if (roleAdminResults.length == 0) {
            role.create({
                name: 'admin'
            }, function (err, roleResult) {
                if (err) return err;

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
                        roleResult.principals.create({
                            principalType: roleMapping.USER,
                            principalId: userResult.id
                        }, function (err, principalResult) {

                        })
                    }
                });
            });

            role.create({
                name: 'member'
            }, function (err, roleResult) {
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