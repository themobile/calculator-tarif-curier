Parse.Cloud.job("CreateApplication", function (request, status) {
    Parse.Cloud.useMasterKey();
    _createAdminUsers().then(function () {
//        return _createRoles();    // merge doar o data, altfel at tb sa schimb codul si sa nu mai creeze rolul daca exista deja
        return Parse.Promise.as();
    }).then(function () {
            return _createSchema();
        }).then(function () {
            status.success("OK");
        }, function (error) {
            _Log(error);
            status.error(JSON.stringify(error));
        });
});

var CTCSchema = {
    columnTypeDefaults: {
        date: {
            __type: "Date",
            iso: "2013-01-01T00:00:00.000Z"
        },
        string: "abcdABCD01234",
        integer: 1234567,
        money: 123243.7698,
        boolean: true,
        object: {},
        array: []
    },
    tables: [
        {
            name: "AppJob",
            columns: [
                {
                    name: "name", type: "string"
                },
                {
                    name: "runCounter", type: "integer"
                },
                {
                    name: "parameters", type: "object"
                }
            ]
        },
        {
            name: "AppJobRunHistory",
            columns: [
                {
                    name: "name", type: "string"
                },
                {
                    name: "jobId", type: "pointer", default: {__type: "Pointer", className: "AppJob", objectId: "Q2AktMb7uA"}
                },
                {
                    name: "isSuccess", type: "boolean"
                },
                {
                    name: "isError", type: "boolean"
                },
                {
                    name: "isOther", type: "boolean"
                },
                {
                    name: "runCounter", type: "integer"
                },
                {
                    name: "status", type: "string"
                },
                {
                    name: "statusObject", type: "object"
                },
                {
                    name: "jobIdText", type: "string"
                },
                {
                    name: "parameters", type: "object"
                }
            ]
        },
        {
            name: "Quote",
            columns: [
                {
                    name: "sequence", type: "integer"
                },
                {
                    name: "author", type: "string"
                },
                {
                    name: "body", type: "string"
                },
                {
                    name: "link", type: "string"
                },
                {
                    name: "isDeleted", type: "boolean"
                },
                {
                    name: "imageSource", type: "string"
                }
            ]
        },
        {
            name: "Sequence",
            columns: [
                {
                    name: "identity", type: "integer"
                },
                {
                    name: "tableName", type: "string"
                }
            ]
        },
        {
            name: "Tariff",
            columns: [
                {name: "name", type: "string"},
                {name: "isDeleted", type: "boolean"},
                {name: "tva", type: "money"},
                {name: "IndiceCombustibil", type: "money"},
                {name: "IndiceCombustibilAditionale", type: "money"},
                {name: "ConditieMinKg", type: "money"},
                {name: "ConditieMaxKg", type: "money"},
                {name: "PlicMax1KgLoco", type: "money"},
                {name: "ColetPrimulKgLoco", type: "money"},
                {name: "ColetPrimele10KgLoco", type: "money"},
                {name: "ColetKgSuplimentarLoco", type: "money"},
                {name: "PlicMax1KgNational", type: "money"},
                {name: "ColetPrimulKgNational", type: "money"},
                {name: "ColetKgSuplimentarNational", type: "money"},
                {name: "KmExterioriNational", type: "money"},
                {name: "DeservireSpecialaNational", type: "money"},
                {name: "Asigurare", type: "money"},
                {name: "RambursFix", type: "money"},
                {name: "RambursVariabil", type: "money"},
                {name: "RambursDocumenteFixLoco", type: "money"},
                {name: "RambursDocumenteVariabilLoco", type: "money"},
                {name: "RambursDocumenteFixNational", type: "money"},
                {name: "RambursDocumenteVariabilNational", type: "money"},
                {name: "RambursNumerarFixLoco", type: "money"},
                {name: "RambursNumerarFixNational", type: "money"},
                {name: "ReturDocumente", type: "money"},
                {name: "ReturDocumenteLoco", type: "money"},
                {name: "ReturDocumenteVariabil", type: "money"},
                {name: "ConfirmareLivrare", type: "money"},
                {name: "ConfirmareLivrareLoco", type: "money"},
                {name: "InfoNumeServiciuCurierat", type: "string"},
                {name: "InfoNumarLocalitatiRetea", type: "string"},
                {name: "InfoKgMaxColet", type: "string"},
                {name: "InfoCmMaxColet", type: "string"},
                {name: "Telefon", type: "sting"},
                {name: "Url", type: "string"},
                {name: "UrlComanda", type: "string"}
            ]
        }
    ]
};

var adminUsers = [
    {"username": "chindea.daniel@gmail.com", "password": "danny092", "firstName": "Daniel", "lastName": "Chindea"
    },
    {"username": "florian.cechi@gmail.com", "password": "anec27", "firstName": "Florian", "lastName": "Cechi"
    }
];

_createSchema = function () {
    var promise = new Parse.Promise()
        , prm = Parse.Promise.as()
        ;

    _.each(CTCSchema.tables, function (table) {
        prm = prm.then(function () {
            return _createSchemaTable(table);
        })
    });

    prm = prm.then(function () {
        promise.resolve({});
    }, function (error) {
        promise.reject(error);
    });

    return promise;
};

_createSchemaTable = function (table) {
    var promise = new Parse.Promise()
        ;
    var newObject = Parse.Object.extend(table.name);
    newObject = new newObject();
    _.each(table.columns, function (column) {
        newObject.set(column.name, iif(column.default, column.default, CTCSchema.columnTypeDefaults[column.type]));
    });
    newObject.save().then(function (objSaved) {
        if (objSaved) {
            return objSaved.destroy();
        } else {
            return Parse.Promise.error("Object was not created! (" + table.name + ")");
        }
    }).then(function () {
            promise.resolve({});
        }, function (error) {
            promise.reject(error);
        });
    return promise;
};

_createRoles = function () {
    var promise = new Parse.Promise();
    var usr = [];
    var adminRole;
    _.each(adminUsers, function (adminUser) {
        usr.push(adminUser.username);
    });
    var qAdmin = new Parse.Query(Parse.User);
    qAdmin.containedIn("email", usr);
    qAdmin.find().then(function (admins) {
        var roleACL = new Parse.ACL();
        roleACL.setPublicReadAccess(true);
        roleACL.setRoleReadAccess("Administrators", true);
        roleACL.setRoleWriteAccess("Administrators", true);
        var roleAdmin = new Parse.Role("Administrators", roleACL);
        for (var i = 0, n = admins.length; i < n; i++) {
            roleAdmin.getUsers().add(admins[i]);
        }
        return roleAdmin.save();
    }).then(function (roleAdminSaved) {
            adminRole = roleAdminSaved;
            var qUser = new Parse.Query(Parse.User);
            qUser.notContainedIn("email", usr);
            return qUser.find();
        }).then(function (users) {
            var roleACL = new Parse.ACL();
            roleACL.setPublicReadAccess(true);
            roleACL.setRoleReadAccess("Administrators", true);
            roleACL.setRoleWriteAccess("Administrators", true);
            var role = new Parse.Role("Users", roleACL);
            for (var i = 0, n = users.length; i < n; i++) {
                role.getUsers().add(users[i]);
            }
            role.getRoles().add(adminRole);
            return role.save();
        }).then(function () {
            promise.resolve({});
        }, function (error) {
            promise.reject(error);
        });
    return promise;
};

_createAdminUsers = function () {
    var promise = new Parse.Promise()
        ;

    var prm = Parse.Promise.as();
    _.each(adminUsers, function (user) {
        prm = prm.then(function () {
            return _createUserIfNotExists(user);
        });
    });
    prm = prm.then(function () {
        promise.resolve({});
    }, function (error) {
        promise.reject(error);
    });
    return promise;
};

_createUserIfNotExists = function (user) {
    var promise = new Parse.Promise()
        ;
    var qUser = new Parse.Query(Parse.User);
    qUser.equalTo("email", user.username);
    qUser.first().then(function (userFnd) {
        if (userFnd) {
            return Parse.Promise.as();
        } else {
            var userNew = new Parse.User();
            userNew.set("username", user.username);
            userNew.set("email", user.username);
            userNew.set("password", user.password);
            userNew.set("firstName", user.firstName);
            userNew.set("lastName", user.lastName);
            return userNew.signUp();
        }
    }).then(function (userSaved) {
            promise.resolve(userSaved);
        }, function (error) {
            promise.reject(error);
        });
    return promise;
};


