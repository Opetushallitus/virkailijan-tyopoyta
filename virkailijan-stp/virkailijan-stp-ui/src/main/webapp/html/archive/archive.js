var YearTreeUI = function($filter, CalendarUtil, ClickUIModels){
	var year = function(year) {
		this.open = false;
		this.name = year;
		this.f = function(row) {
			return (CalendarUtil.toDate(row.date)).getFullYear() == year;
		}
		this.months = [];
		var month = function(month, order) {
			this.name = month;
			this.f = function(row) {
				var d = CalendarUtil.toDate(row.date);
				return d.getFullYear() == year && d.getMonth() == (order-1);
			}
		};
		for (var i=1; i<=12; i++) {
			this.months.push(new month($filter('i18n')("calendar.month."+i),i));
		}
	}
	var model = function() {
		this.clicked = function(node, group) {
			_(ClickUIModels).forEach(function(ClickUIModel) {
				if (typeof node.months != "undefined") { //is it year-node?
					if (!node.checked) { //clear selected months if there are any
						_(node.months).forEach(function(month) {
							month.checked = false;
							ClickUIModel.clicked(month, group);
						});
					}
				}
				ClickUIModel.clicked(node, group);
			});
		}
		this.years = [];
		var d = parseInt((new Date()).getFullYear());
		for (var i=0; i<(d-2012); i++) {
			this.years.push(new year(""+(d-i)));
		}
	};
	return new model;
}

app.factory('YearTreeUIModel', function($filter, CalendarUtil, ArchiveAnnouncementsUIModel, ArchiveMaterialsUIModel) {
	return new YearTreeUI($filter, CalendarUtil, [ArchiveAnnouncementsUIModel, ArchiveMaterialsUIModel] );
});

app.factory("TabsStateUIModel", function() {
	var model = new function() {
		this.tab0 = false;
		this.tab1 = true;
		this.set_activetab = function(tab) {
			tab = true;
		}
	}
	return model;
});

function ArchiveController($scope,
			breadcrumbs,
			TabsStateUIModel,
			SearchTxtUIModel,
			AnnouncementsSortOrderUIModel,
			MaterialsSortOrderUIModel,
			CategoriesUIModel,
			TagsUIModel,
			ArchiveAnnouncementsUIModel,
			ArchiveMaterialsUIModel,
			YearTreeUIModel,
			SelectedCategoriesModel) {
	$scope.identity = angular.identity;
	$scope.breadcrumbs = breadcrumbs;
	$scope.selectedcategoriesmodel = SelectedCategoriesModel;
	$scope.categoriesmodel = CategoriesUIModel;
	$scope.tagsmodel = TagsUIModel;
	$scope.$watch('categoriesmodel.ready', function(newValue, oldValue) {
		if (newValue) {
			$scope.selectedcategoriesmodel.init();
		}
    });
	
	$scope.year_tree = YearTreeUIModel;
	
	$scope.announcementsmodel = ArchiveAnnouncementsUIModel;
	$scope.announcementsortmodel = AnnouncementsSortOrderUIModel;

	$scope.materialsmodel = ArchiveMaterialsUIModel;
	$scope.materialssortmodel = MaterialsSortOrderUIModel;

	$scope.tabState = TabsStateUIModel;
	$scope.searchmodel = SearchTxtUIModel;
}

app.controller('announcementsTabCtrl', ['$scope', 'AnnouncementsSortOrderUIModel', 'ArchiveAnnouncementsUIModel', function($scope, AnnouncementsSortOrderUIModel, ArchiveAnnouncementsUIModel) {
	$scope.sortmodel = AnnouncementsSortOrderUIModel;
	$scope.paginationmodel = ArchiveAnnouncementsUIModel;
	$scope.listmodel = ArchiveAnnouncementsUIModel;
	$scope.linkUrl="#/etusivu/arkisto/tiedote/";
}]).controller('materialsTabCtrl', ['$scope', 'MaterialsSortOrderUIModel', 'ArchiveMaterialsUIModel', function($scope, MaterialsSortOrderUIModel, ArchiveMaterialsUIModel) {
	$scope.sortmodel = MaterialsSortOrderUIModel;
	$scope.paginationmodel = ArchiveMaterialsUIModel;
	$scope.listmodel = ArchiveMaterialsUIModel;
	$scope.linkUrl="#/etusivu/arkisto/materiaali/";
}]);