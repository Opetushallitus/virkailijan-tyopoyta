
app.factory('LatestAnnouncementsPopulator', function(LatestAnnouncements, $filter) {
	return new ModelPopulator(LatestAnnouncements, $filter('i18n')("desktop.announcements.messages.errors.loadingannouncements"));
});

app.factory('LatestAnnouncementsUIModel', function(LatestAnnouncementsPopulator, $filter) {
	var uiFilterModel = new  UIFilterModel(LatestAnnouncementsPopulator);
	uiFilterModel.transform = function(rows) {
		_(rows).forEach(function(row) {
			row.title_plain_short = $filter('words')(row.title_plain, "8");
		});
    	return rows;
    }
	return uiFilterModel.setParams({});
});

app.factory('LatestEventsPopulator', function(Events, $filter) {
	var eventsResultValidator = new PostResultValidator;
	eventsResultValidator.result = function(result) {
		_(result.events).forEach(function(event) {
			event.categories = event.event_categories;
		});
		return result.events;
	}
	return new ModelPopulator(Events, $filter('i18n')("desktop.events.messages.errors.loadingevents"), eventsResultValidator);
});

app.factory('LatestEventsUIModel', function(LatestEventsPopulator) {	
	return new UIFilterModel(LatestEventsPopulator).setParams({});
});

app.factory('LatestMaterialsPopulator', function(LatestMaterials, $filter) {
	return new ModelPopulator(LatestMaterials, $filter('i18n')("desktop.materials.messages.errors.loadingmaterials"));
});

app.factory('LatestMaterialsUIModel', function(LatestMaterialsPopulator) {	
	return new UIFilterModel(LatestMaterialsPopulator).setParams({});
});

app.factory('TextSearchAnnoucementsPopulator', function(TextSearchAnnouncements, $filter) {
	return new ModelPopulator(TextSearchAnnouncements, $filter('i18n')("desktop.announcements.messages.errors.loadingannouncements"));
});

app.factory('ArchiveAnnouncementsUIModel', function(TextSearchAnnoucementsPopulator, $filter) {
	var uiFilterModel = new  UIFilterModel(TextSearchAnnoucementsPopulator);
	uiFilterModel.transform = function(rows) {
		_(rows).forEach(function(row) {
			row.title_plain_short = $filter('words')(row.title_plain, "8");
		});
    	return rows;
    }
	return uiFilterModel;
});

app.factory('TextSearchMaterialsPopulator', function(TextSearchMaterials, $filter) {
	return new ModelPopulator(TextSearchMaterials, $filter('i18n')("desktop.materials.messages.errors.loadingmaterials"));
});

app.factory('ArchiveMaterialsUIModel', function(TextSearchMaterialsPopulator, $filter) {
	var uiFilterModel = new  UIFilterModel(TextSearchMaterialsPopulator);
	uiFilterModel.transform = function(rows) {
		_(rows).forEach(function(row) {
			row.title_plain_short = $filter('words')(row.title_plain, "8");
		});
    	return rows;
    }
	return uiFilterModel;
});

app.factory("SearchTxtUIModel", function(AnnouncementsSortOrderUIModel, MaterialsSortOrderUIModel) {
	var model = new function() {
		this.searchtext = "";
		this.search = function() {
			model.searchedtext = model.searchtext;
			AnnouncementsSortOrderUIModel.search(model.searchtext);
			MaterialsSortOrderUIModel.search(model.searchtext);
		}
	}
	return model;
});

var SearchUI = function(UIModel) {
	var model = new function() {
		this.sort_order = "title ASC";
		this.order_by = "title";
		this.order ="ASC";
		this.searchtext = "";
		this.search = function(txt) {
			model.searchtext =  txt;
			model.setParams();
		};
		this.sort = function() {
			var _sort=this.sort_order.split(" ");
			model.order_by=_sort[0];
			model.order=_sort[1];
			if (UIModel.ready) {
				model.setParams();
			}		
		}
		this.setParams = function() {
			UIModel.setParams(
					{ "search"  : model.searchtext.length==0 ? '<search_for_all>' : model.searchtext ,
					  "order"   : model.order,
					  "orderby" : model.order_by
			});
		}
	}
	return model;
};

app.factory("AnnouncementsSortOrderUIModel", function(ArchiveAnnouncementsUIModel) {
	return new SearchUI(ArchiveAnnouncementsUIModel);
});

app.factory("MaterialsSortOrderUIModel", function(ArchiveMaterialsUIModel) {
	return new SearchUI(ArchiveMaterialsUIModel);
});

app.factory('CategoriesPopulator', function(Categories, $filter) {
	var categoriesResultValidator = new PostResultValidator;
	categoriesResultValidator.result = function(result) {
		return result.categories;
	}	
	return new ModelPopulator(Categories, $filter('i18n')("desktop.categories.messages.errors.loadingcategories"), categoriesResultValidator);
});

app.factory('SelectedCategoriesModel', function($filter, LatestAnnouncementsUIModel, LatestEventsUIModel, LatestMaterialsUIModel, ArchiveAnnouncementsUIModel, ArchiveMaterialsUIModel, CategoriesUIModel, UserOrganisations, Profiles) {
	var model = new function() {
		this.ready = false;
		this.rows = [];
		this.clicked = function(category) {
			if (category.checked && !this.rows.contains(category)) {
				this.rows.push(category);
			}
			if (!category.checked) {
				this.rows.remove(category);
			}
			CategoriesUIModel.clicked(category);
			LatestAnnouncementsUIModel.clicked(category, 1);
			LatestEventsUIModel.clicked(category, 1);
			LatestMaterialsUIModel.clicked(category, 1);

			ArchiveAnnouncementsUIModel.clicked(category, 1);
			ArchiveMaterialsUIModel.clicked(category, 1);
		}

		this.init = function() {
			if (model.ready) {
				return;
			}
			model.ready=true;
			var getProfiles = function(orgOid) {
				Profiles.post([orgOid],function(slugs){
					_(_.filter(CategoriesUIModel.rows, function(category) {
						return slugs.contains(category.slug);
					})).forEach(function(category){
						if (_.isUndefined(category.checked) || !category.checked) {
							category.checked = true;
							model.clicked(category)
						}
					});
				});
			}
			UserOrganisations.get([],
				function(orgs) {
					_(orgs).forEach(function(org) {
						getProfiles(org.organisaatioOid);
				});
			});
		}
	}
	return model;
});

app.factory('CategoriesUIModel', function(CategoriesPopulator) {
	var model = new UIListModel(CategoriesPopulator).setParams({});
	model.clicked = function(category) {
		if (category.checked) {
			category.f = function(row) {
				if (_.isUndefined(row.categories)) {
					return false;
				}
				return $.map( row.categories, function( _category ) {
					return _category.slug;
				}).contains(category.slug);
			}
		} 
	}
	return model;
});

app.factory('TagsPopulator', function(Tags, $filter) {
	var tagsResultValidator = new PostResultValidator();
	tagsResultValidator.result = function(result) {
		//add a tag, that represents those that have no tag (ie. common messages)
		result.tags.unshift(
				{
					slug : "",
					title: $filter('i18n')("desktop.materials.title.commonmessages")
				}
		);
		_(result.tags).forEach(function(tag) {
			tag.rows = [];
			tag.maxlines = INITIALLINES;
			tag.showmore = function() {
				tag.maxlines += SHOWMORELINES;
	        }			
		});
		return result.tags;
	}	
	return new ModelPopulator(Tags, $filter('i18n')("desktop.tags.messages.errors.loadingtags"), tagsResultValidator);
});

app.factory('TagsUIModel', function(TagsPopulator,  ArchiveMaterialsUIModel, ArchiveAnnouncementsUIModel) {
	var model = new UIListModel(TagsPopulator).setParams({});
	model.clicked = function(tag) {
		if (tag.checked) {
			tag.f = function(row) {
				return $.map( row.tags, function( _tag ) {
					return _tag.slug;
				}).contains(tag.slug);				
			}
		}
		ArchiveMaterialsUIModel.clicked(tag, 2);
		ArchiveAnnouncementsUIModel.clicked(tag, 2);
	}
	return model;
});

app.factory('LatestMaterial', function(LatestMaterialsUIModel) {
	var model = new function() {
		this.post = null;
		this.refresh = function() {
			model.post  = _.max(LatestMaterialsUIModel.rows, function(row) {
			  return toDate(row.date);
			});
		}
	}
	model.refresh();
	return model;
});

function PostsController($scope, TagsUIModel, breadcrumbs, LatestAnnouncementsUIModel, LatestEventsUIModel, LatestMaterialsUIModel, SearchTxtUIModel, Profiles, CategoriesUIModel, SelectedCategoriesModel, $location, LatestMaterial) {

	$scope.selectedcategoriesmodel = SelectedCategoriesModel;
	$scope.categoriesmodel = CategoriesUIModel;
	$scope.tagsmodel = TagsUIModel;
	$scope.$watch('categoriesmodel.ready', function(newValue, oldValue) {
		if (newValue) {
			$scope.selectedcategoriesmodel.init();
		}
    });
	$scope.breadcrumbs = breadcrumbs;
	$scope.identity = angular.identity;
	$scope.announcementsmodel = LatestAnnouncementsUIModel
	$scope.eventsmodel = LatestEventsUIModel
	$scope.materialsmodel = LatestMaterialsUIModel
	$scope.searchmodel = SearchTxtUIModel;
	$scope.location = $location;
	$scope.toArchive = function() {
		SearchTxtUIModel.search();
		$scope.location.path("/etusivu/arkisto");
	}
	$scope.latestMaterial = LatestMaterial;
	$scope.$watch('materialsmodel.rows.length', function(newValue, oldValue) {
		LatestMaterial.refresh();
    });
}

