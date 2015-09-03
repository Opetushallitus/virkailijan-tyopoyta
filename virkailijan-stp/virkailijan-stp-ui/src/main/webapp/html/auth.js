var READ = "_READ";
var UPDATE = "_READ_UPDATE";
var CRUD = "_CRUD";
var OPH_ORG = "1.2.246.562.10.00000000001";

app.factory('MyRolesModel', function($q, $http) {
    var deferred = $q.defer();

    var factory = (function() {
        var instance = {};
        instance.myroles = [];

        $http.get(CAS_URL).success(function(result) {
            instance.myroles = result;
            deferred.resolve(instance);
        });

        return instance;
    })();

    return deferred.promise;
});

app.factory('AuthService', function($q, $http, $timeout, MyRolesModel, loadingService) {

    // organisation check
    var readAccess = function(service,org,model) {
        if( model.myroles.indexOf(service + READ + "_" + org) > -1 ||
            model.myroles.indexOf(service + UPDATE + "_" + org) > -1 ||
            model.myroles.indexOf(service + CRUD + "_" + org) > -1) {
            return true;
        }
    };

    var updateAccess = function(service,org,model) {

        if( model.myroles.indexOf(service + UPDATE + "_" + org) > -1 ||
            model.myroles.indexOf(service + CRUD + "_" + org) > -1) {
            return true;
        }
    };

    var crudAccess = function(service,org,model) {

        if( model.myroles.indexOf(service + CRUD + "_" + org) > -1) {
            return true;
        }
    };

    var anyUpdateAccess = function(service,model) {
        var found = false;
        model.myroles.forEach(function(role) {
            if( role.indexOf(service + UPDATE) > -1 ||
                role.indexOf(service + CRUD) > -1) {
                found = true;
            }
        });
        return found;
    };

    var anyCrudAccess = function(service,model) {
        var found = false;
        model.myroles.forEach(function(role) {
            if( role.indexOf(service + CRUD) > -1) {
                found = true;
            }
        });
        return found;
    };


    var accessCheck = function(service, orgOid, accessFunction) {
        var deferred = $q.defer();

        MyRolesModel.then(function(model){
            $http.get(ORGANIZATION_SERVICE_URL_BASE + "rest/organisaatio/" + orgOid + "/parentoids").success(function(result) {
                var found = false;
                result.split("/").forEach(function(org){
                    if(accessFunction(service, org, model)){
                        found = true;
                    }
                });
                if(found) {
                    deferred.resolve();
                } else {
                    deferred.reject();
                }
            });
        });

        return deferred.promise;
    };

    // OPH check -- voidaan ohittaa organisaatioiden haku
    var ophRead = function(service,model) {
        return (model.myroles.indexOf(service + READ + "_" + OPH_ORG) > -1
            || model.myroles.indexOf(service + UPDATE + "_" + OPH_ORG) > -1
            || model.myroles.indexOf(service + CRUD + "_" + OPH_ORG) > -1);

    };

    var ophUpdate = function(service,model) {
        return (model.myroles.indexOf(service + UPDATE + "_" + OPH_ORG) > -1
            || model.myroles.indexOf(service + CRUD + "_" + OPH_ORG) > -1);
    };

    var ophCrud = function(service,model) {
        return (model.myroles.indexOf(service + CRUD + "_" + OPH_ORG) > -1);
    };

    var ophAccessCheck = function(service, accessFunction) {
        var deferred = $q.defer();

        MyRolesModel.then(function(model){
            if(accessFunction(service, model)) {
                deferred.resolve();
            } else {
                deferred.reject();
            }
        });

        return deferred.promise;
    };

    return {
        readOrg : function(service, orgOid) {
            return accessCheck(service, orgOid, readAccess);
        },

        updateOrg : function(service, orgOid) {
            return accessCheck(service, orgOid, updateAccess);
        },

        crudOrg : function(service, orgOid) {
            return accessCheck(service, orgOid, crudAccess);
        },

        readOph : function(service) {
            return ophAccessCheck(service, ophRead);
        },

        updateOph : function(service) {
            return ophAccessCheck(service, ophUpdate);
        },

        crudOph : function(service) {
            return ophAccessCheck(service, ophCrud);
        },

        crudAny : function(service) {
            return ophAccessCheck(service, anyCrudAccess);
        },

        updateAny : function(service) {
            return ophAccessCheck(service, anyUpdateAccess);
        },

        getOrganizations : function(service) {
            var deferred = $q.defer();

            MyRolesModel.then(function(model){
                organizations = [];

                model.myroles.forEach(function(role) {
                    // TODO: refaktor
                    var org;
                    if(role.indexOf(service + "_CRUD_") > -1) {
                        org = role.replace(service + "_CRUD_", '');
                    } else if(role.indexOf(service + "_READ_UPDATE_") > -1) {
                        org = role.replace(service + "_READ_UPDATE_", '');
                    } else if(role.indexOf(service + "_READ_UPDATE") == -1 && role.indexOf(service + "_READ_") > -1) {
                        org = role.replace(service + "_READ_", '');
                    }

                    if(org && organizations.indexOf(org) == -1) {
                        organizations.push(org);
                    }
                });

                deferred.resolve(organizations);
            });
            return deferred.promise;
        }

    };
});