app.factory('MaterialModel', function(Material) {
    var model;
    model = new function() {
    	this.init = function(scope, materiaaliid, sce) {
            model.getEvent(scope, materiaaliid, sce);
        };
        this.getEvent = function(scope, materiaaliid, sce) {
        	Material.get({ id : materiaaliid }, function(result) {
        		model.material = result.post;
        		scope.htmlContent = sce.trustAsHtml(preFormattedHtml(result.post.content));
        		scope.loadingReady = true;
        	});
        };
    };
    return model;
});

function ViewMaterialController($scope, breadcrumbs, $routeParams, $sce, MaterialModel) {
    $scope.identity = angular.identity;
    $scope.breadcrumbs = breadcrumbs;
	$scope.model = MaterialModel;
    MaterialModel.init($scope, $routeParams.materiaaliid, $sce);
}