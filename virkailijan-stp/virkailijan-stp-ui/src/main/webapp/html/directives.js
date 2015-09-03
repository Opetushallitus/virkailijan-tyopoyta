app.directive('auth', function($animate, $timeout, AuthService) {
    return {
        link : function($scope, element, attrs) {

            element.addClass('ng-hide');

            var success = function() {
                if (additionalCheck()) {
                    element.removeClass('ng-hide');
                }
            };
            var additionalCheck = function() {
                if (attrs.authAdditionalCheck) {
                    var temp = $scope.$eval(attrs.authAdditionalCheck);
                    return temp;
                }
                return true;
            };
            $timeout(function() {
                switch (attrs.auth) {

                case "crudOph":
                    AuthService.crudOph(attrs.authService).then(success);
                    break;

                case "updateOph":
                    AuthService.updateOph(attrs.authService).then(success);
                    break;

                case "readOph":
                    AuthService.readOph(attrs.authService).then(success);
                    break;

                case "crudAny":
                    AuthService.crudAny(attrs.authService).then(success);
                    break;

                case "updateAny":
                    AuthService.updateAny(attrs.authService).then(success);
                    break;
                }
            }, 0);

            attrs.$observe('authOrg', function() {
                if (attrs.authOrg) {
                    switch (attrs.auth) {
                    case "crud":
                        AuthService.crudOrg(attrs.authService, attrs.authOrg).then(success);
                        break;

                    case "update":
                        AuthService.updateOrg(attrs.authService, attrs.authOrg).then(success);
                        break;

                    case "read":
                        AuthService.readOrg(attrs.authService, attrs.authOrg).then(success);
                        break;
                    }
                }
            });

        }
    };
});

/**
 * Source: http://kkurni.blogspot.com.au/2013/10/angularjs-ng-option-with-ie8.html
 * General-purpose Fix IE 8 issue with parent and detail controller.
 * 
 * @example <select sk-ie-select="parentModel">
 * 
 * @param sk-ie-select
 *            require a value which depend on the parent model, to trigger rendering in IE8
 */
app.directive('ieSelectFix', [ function() {

    return {
        restrict : 'A',
        require : 'ngModel',
        link : function(scope, element, attributes, ngModelCtrl) {
            var isIE = document.attachEvent;
            if (!isIE)
                return;
            var control = element[0];
            // to fix IE8 issue with parent and detail controller, we need to depend on the parent controller
            scope.$watch(attributes.ieSelectFix, function() {
                // this will add and remove the options to trigger the rendering in IE8
                var option = document.createElement("option");
                control.add(option, null);
                control.remove(control.options.length - 1);
            });
        }
    };
} ]);



