app.factory('AnnouncementModel', function(Announcement) {
    var model;
    model = new function() {
    	this.init = function(scope, tiedoteid, sce) {
            model.getAnnouncement(scope, tiedoteid, sce);
        };
        this.getAnnouncement = function(scope, tiedoteid, sce) {
        	Announcement.get({ id : tiedoteid }, function(result) {
        		model.announcement = result.post;
        		scope.htmlContent = sce.trustAsHtml(preFormattedHtml(result.post.content));
        		scope.htmlTitle = sce.trustAsHtml(result.post.title);
        		scope.loadingReady = true;
        	});
        };
    };
    return model;
});

function ViewAnnouncementController($scope, breadcrumbs, $routeParams, $sce, AnnouncementModel) {
    $scope.identity = angular.identity;
	$scope.breadcrumbs = breadcrumbs;
	$scope.model = AnnouncementModel;
    AnnouncementModel.init($scope, $routeParams.tiedoteid, $sce);
}