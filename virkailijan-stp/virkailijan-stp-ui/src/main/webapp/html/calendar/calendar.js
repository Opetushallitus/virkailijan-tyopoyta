angular.module("template/datepicker/year.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/datepicker/year.html",
    "<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn calendar nextprev\" ng-click=\"move(-1)\" tabindex=\"-1\"><b>&lt;</b></button></th>\n" +
    "      <th colspan=\"3\"><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn calendar nextprev\" ng-click=\"toggleMode()\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn calendar nextprev\" ng-click=\"move(1)\" tabindex=\"-1\"><b>&gt;</b></button></th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr ng-repeat=\"row in rows track by $index\">\n" +
    "      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
    "        <button type=\"button\" style=\"width:100%;\" class=\"btn calendar\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt), 'text-info': dt.current}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-info': dt.current}\">{{dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);

var monthNamesS =
	"<div ng-show=\"(dt.date.getMonth() == 0)\">{{'calendar.january' | i18n}}</div>"+
	"<div ng-show=\"(dt.date.getMonth() == 1)\">{{'calendar.february' | i18n}}</div>"+
	"<div ng-show=\"(dt.date.getMonth() == 2)\">{{'calendar.march' | i18n}}</div>"+
	"<div ng-show=\"(dt.date.getMonth() == 3)\">{{'calendar.april' | i18n}}</div>"+
	"<div ng-show=\"(dt.date.getMonth() == 4)\">{{'calendar.may' | i18n}}</div>"+
	"<div ng-show=\"(dt.date.getMonth() == 5)\">{{'calendar.june' | i18n}}</div>"+
	"<div ng-show=\"(dt.date.getMonth() == 6)\">{{'calendar.july' | i18n}}</div>"+
	"<div ng-show=\"(dt.date.getMonth() == 7)\">{{'calendar.august' | i18n}}</div>"+
	"<div ng-show=\"(dt.date.getMonth() == 8)\">{{'calendar.september' | i18n}}</div>"+
	"<div ng-show=\"(dt.date.getMonth() == 9)\">{{'calendar.october' | i18n}}</div>"+
	"<div ng-show=\"(dt.date.getMonth() == 10)\">{{'calendar.november' | i18n}}</div>"+
	"<div ng-show=\"(dt.date.getMonth() == 11)\">{{'calendar.december' | i18n}}</div>";

angular.module("template/datepicker/month.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/datepicker/month.html",
    "<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn calendar nextprev\" ng-click=\"move(-1)\" tabindex=\"-1\"><b>&lt;</b></button></th>\n" +
    "      <th><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn calendar nextprev\" ng-click=\"toggleMode()\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn calendar nextprev\" ng-click=\"move(1)\" tabindex=\"-1\"><b>&gt;</b></button></th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr ng-repeat=\"row in rows track by $index\">\n" +
    "      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
    "        <button type=\"button\" style=\"width:100%;\" class=\"btn calendar\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt), 'text-info': dt.current}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-info': dt.current}\">"+monthNamesS+"</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]); 

var outsideMonthB =
	"(( $parent.$index<2 && dt.date.getDate()>15 ) ||"+
	" ( $parent.$index>3 && dt.date.getDate()<19 ))";

var weekendDayB = " ($index > 4) ";

var monthNameS =
	"<div ng-show=\"(rows[3][3].date.getMonth() == 0)\">{{'calendar.january' | i18n}} {{rows[3][3].date.getFullYear()}}</div>"+
	"<div ng-show=\"(rows[3][3].date.getMonth() == 1)\">{{'calendar.february' | i18n}} {{rows[3][3].date.getFullYear()}}</div>"+
	"<div ng-show=\"(rows[3][3].date.getMonth() == 2)\">{{'calendar.march' | i18n}} {{rows[3][3].date.getFullYear()}}</div>"+
	"<div ng-show=\"(rows[3][3].date.getMonth() == 3)\">{{'calendar.april' | i18n}} {{rows[3][3].date.getFullYear()}}</div>"+
	"<div ng-show=\"(rows[3][3].date.getMonth() == 4)\">{{'calendar.may' | i18n}} {{rows[3][3].date.getFullYear()}}</div>"+
	"<div ng-show=\"(rows[3][3].date.getMonth() == 5)\">{{'calendar.june' | i18n}} {{rows[3][3].date.getFullYear()}}</div>"+
	"<div ng-show=\"(rows[3][3].date.getMonth() == 6)\">{{'calendar.july' | i18n}} {{rows[3][3].date.getFullYear()}}</div>"+
	"<div ng-show=\"(rows[3][3].date.getMonth() == 7)\">{{'calendar.august' | i18n}} {{rows[3][3].date.getFullYear()}}</div>"+
	"<div ng-show=\"(rows[3][3].date.getMonth() == 8)\">{{'calendar.september' | i18n}} {{rows[3][3].date.getFullYear()}}</div>"+
	"<div ng-show=\"(rows[3][3].date.getMonth() == 9)\">{{'calendar.october' | i18n}} {{rows[3][3].date.getFullYear()}}</div>"+
	"<div ng-show=\"(rows[3][3].date.getMonth() == 10)\">{{'calendar.november' | i18n}} {{rows[3][3].date.getFullYear()}}</div>"+
	"<div ng-show=\"(rows[3][3].date.getMonth() == 11)\">{{'calendar.december' | i18n}} {{rows[3][3].date.getFullYear()}}</div>";

var weekdayNameS =
 	"<div ng-show=\"($index == 0)\">{{'calendar.monday' | i18n}}</div>"+
 	"<div ng-show=\"($index == 1)\">{{'calendar.tuesday' | i18n}}</div>"+
 	"<div ng-show=\"($index == 2)\">{{'calendar.wednesday' | i18n}}</div>"+
 	"<div ng-show=\"($index == 3)\">{{'calendar.thursday' | i18n}}</div>"+
 	"<div ng-show=\"($index == 4)\">{{'calendar.friday' | i18n}}</div>"+
 	"<div ng-show=\"($index == 5)\">{{'calendar.saturday' | i18n}}</div>"+
 	"<div ng-show=\"($index == 6)\">{{'calendar.sunday' | i18n}}</div>";

angular.module("template/datepicker/day.html", []).run(["$templateCache", function($templateCache) {
	  $templateCache.put("template/datepicker/day.html",
	    "<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
	    "  <thead>\n" +
	    "    <tr>\n" +
	    "      <th><button type=\"button\" class=\"btn calendar nextprev\" ng-click=\"move(-1)\" tabindex=\"-1\" ><b>&lt;</b></button></th>\n" +
	    "      <th colspan=\"{{5 + showWeeks}}\"><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn calendar month\" ng-click=\"toggleMode()\" style=\"width:100%;\" tabindex=\"-1\" ><strong>"+monthNameS+"</strong></button></th>\n" +
	    "      <th><button type=\"button\" class=\"btn calendar nextprev\" ng-click=\"move(1)\" tabindex=\"-1\"><b>&gt;</b></button></th>\n" +
	    "    </tr>\n" +
	    "    <tr>\n" +
	    "      <th ng-show=\"showWeeks\" class=\"eventCalendar\"></th>\n" +
	    "      <th ng-repeat=\"label in labels track by $index\"><button type=\"button\" tabindex=\"-1\" class=\"btn calendar weekdaynames\">"+weekdayNameS+"</button></th>\n" +
	    "    </tr>\n" +
	    "  </thead>\n" +
	    "  <tbody>\n" +
	    "    <tr ng-repeat=\"row in rows track by $index\">\n" +
	    "      <td ng-show=\"showWeeks\" class=\"eventCalendar\"><em>{{ weekNumbers[$index] }}</em></td>\n" +
	    "      <td ng-repeat=\"dt in row track by dt.date\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
	    "        <button ng-show=\""+outsideMonthB +" && " +weekendDayB+"\" type=\"button\" class=\"btn calendar weekend outsidemonth\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt), 'text-info': dt.current}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-muted': dt.secondary}\">{{dt.label}}</span></button>\n" +
	    "        <button ng-show=\"!"+outsideMonthB+" && " +weekendDayB+"\" type=\"button\" class=\"btn calendar weekend\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-muted': dt.secondary, 'text-info': dt.current}\">{{dt.label}}</span></button>\n" +    
	    "        <button ng-show=\""+outsideMonthB +" && !"+weekendDayB+"\" type=\"button\" class=\"btn calendar outsidemonth\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt), 'text-info': dt.current}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-muted': dt.secondary}\">{{dt.label}}</span></button>\n" +
	    "        <button ng-show=\"!"+outsideMonthB+" && !"+weekendDayB+"\" type=\"button\" class=\"btn calendar\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt), 'text-info': dt.current}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-muted': dt.secondary, 'text-info': dt.current}\">{{dt.label}}</span></button>\n" +    
	    "      </td>\n" +
	    "    </tr>\n" +
	    "  </tbody>\n" +
	    "</table>\n" +
	    "");
	}]);

var DAYS_TO_REQUEST_AT_ONCE=42;

app.service("CalendarUtil", function() {
	this.stringifyDate = function(date, separator) {
		return (date.getFullYear())+separator+(date.getMonth()<9 ?  "0" : "")+(date.getMonth()+1) +separator+(date.getDate()<10 ?  "0" : "") + date.getDate();
	};
	this.toDate = function(wpDate) {
		return new Date( wpDate.replace(/(\d+)-(\d+)-(\d+)/,"$1/$2/$3") );
	}
	this.toWPDate = function(date) {
		return this.stringifyDate(date, '-');
	}
	this.toArray = function(startDate, endDate) {
		var resultList = [];
		if (endDate < startDate)  {
			return resultList;
		}
		var start= this.toDate(this.toWPDate(startDate));
		var end = this.toDate(this.toWPDate(endDate));
		do {
			resultList[resultList.length]= new Date(start);
			start.setDate(start.getDate()+1);
		} while (start<=end);
		return resultList;
	}
});

app.factory("EventDates", function(Events, CalendarUtil, SelectedCategoriesModel, $q) {
    var model;
    model = new function() {
    	this.getEventsPromise = function(date) {
	    	var deferred = $q.defer();
	    	Events.get(
	    	    { 'scope' :CalendarUtil.toWPDate(date)+","+CalendarUtil.toWPDate(date) },
		       	function(result) {
			       		deferred.resolve(result);
	    	    });
	    	return deferred.promise;	
    	}
		this.countEventsPromise = function (startDate, endDate) {
			var hashDate = function(date) {
				return "K"+CalendarUtil.toWPDate(date);
			}
			var toWPDate = function(hashDate) {
				return hashDate.substring(1);
			}
	    	var deferred = $q.defer();
	       	Events.get(
	       	    { 'scope' : CalendarUtil.toWPDate(startDate)+","+CalendarUtil.toWPDate(endDate) }, 
	       	    function(result) {
	       	    	var e = {}; //hash for storing retrieved dates for requested span of events, the value of item contains array of categories 
	       	    				//(slug-attribute) i.e. e["K2015-31-12"] = { count : 3,
	       	    				//											 slugs : ["toinen-aste","perustaso"] }
	       			var span = CalendarUtil.toArray(startDate,endDate);
	       			_(span).forEach(function (el) { e[hashDate(el)] = { count: 0 , slugs: [] }; } ); //init 
		       		if (!_.isUndefined(result.events)) {
		       			_(result.events).forEach(function (event) {
	       					var eventDays = CalendarUtil.toArray(CalendarUtil.toDate(event.event_date_time.event_start_date), 
	       														 CalendarUtil.toDate(event.event_date_time.event_end_date));
	       					_(eventDays).forEach(function (eventDay) {
	       						if (_.isUndefined(e[(key = hashDate(eventDay))])) {
	       							e[key] = { count: 0 , slugs: [] };
	       						}
	       						e[key].count++;
	       						_(event.event_categories).forEach(function (event_category) {
	       							if (!e[key].slugs.contains(event_category.slug)) {
	       								e[key].slugs.push(event_category.slug);
	       							}
	       						})
	       					});
		       			});
		       		}
		       		var returnVal = [];
		       		for (var i in e) {
		       			returnVal[returnVal.length] = {
		       				"count" : e[i].count,
		       			    "date"  : toDate(toWPDate(i)),
		       				"slugs" : e[i].slugs
		       			}
		       		}
		       		deferred.resolve(returnVal);
	       	    });
	       		return deferred.promise;			
			}
    	}
    	return model;
	}
);

app.factory('CalendarModel', function(EventDates, CalendarUtil, $q, SelectedCategoriesModel) {
    var model;
    model = new function() {
    	this.init = function(sce, refreshCallback) {
    		model.eventsReady = false;
    		model.sce = sce;
    		model.refreshCallback = refreshCallback;
    		model.d = {}; 	//hash for storing retrieved dates for requested span of events, the value of item contains array of categories 
							//(slug-attribute) i.e. e["D2015-31-12"] = { count : 3,
							//											 slugs : ["toinen-aste","perustaso"] }
    		model.ReqsPendingCount = 0;
    	}
    	this.refresh = function() {
    		model.refreshCallback();
    	}
    	this.getEvents = function(date) {
    		model.eventsReady = false;
        	(EventDates.getEventsPromise(date)).then(
             	function(result){
             		model.events = [];
             		_(result.events).forEach(function(event) {
             			if( model.inSelectedCategories(_.pluck(event.event_categories,"slug"))) {
             				model.events.push(event);
             			};
             		});
             		_(model.events).forEach(function (el) {
             			el.content = preFormattedHtml(el.content);             			 
             		}); 
             		model.eventsReady = true;
             	}
            );
    	}
    	this.inSelectedCategories = function(slugs) {
    		if (SelectedCategoriesModel.rows.length == 0) {
    			return true;
    		}
    		return (_.intersection(slugs, _.pluck(SelectedCategoriesModel.rows, "slug"))).length > 0;
    	}
    	this.isDateDisabled = function(mode, date) {
        	if (mode != 'day') {
        		return false;
    		}
        	var hashDate = function (date) {
        		return "D"+CalendarUtil.stringifyDate(date,"_");
        	} 
        	var key = hashDate(date);
        	if (!_.isUndefined(_d = model.d[key])) {
        		if (SelectedCategoriesModel.rows.length==0) {
        			return _d.count==0;
        		}
        		return !model.inSelectedCategories(_d.slugs)
        	}
        	if (model.ReqsPendingCount > 0) {
        		return true;
        	}
        	model.ReqsPendingCount++;
        	var start = new Date(date.getFullYear(),date.getMonth(),date.getDate());
        	var end = new Date(date.getFullYear(),date.getMonth(),date.getDate()+DAYS_TO_REQUEST_AT_ONCE);
        	(EventDates.countEventsPromise(start, end)).then(
         		function(results){
         			_(results).forEach(function (result)  {
         				model.d[hashDate(result.date)] = result;
         			});
         			model.ReqsPendingCount--;
         			if (model.ReqsPendingCount == 0) {
         				model.refresh();
         			}
         		}
         	);
        	return true;
        };
    };
    return model;
});

function ViewCalendarController($scope, SelectedCategoriesModel, CategoriesUIModel, breadcrumbs, $routeParams, $sce , CalendarModel, CalendarUtil, $log, $q, $http, $sce, Events) {
    $scope.identity = angular.identity;
    $scope.breadcrumbs = breadcrumbs;
    $scope.categoriesmodel = CategoriesUIModel;
	$scope.selectedcategoriesmodel = SelectedCategoriesModel;
	$scope.$watch('categoriesmodel.ready', function(newValue, oldValue) {
		if (newValue) {
			$scope.selectedcategoriesmodel.init();
		}
    });
    $scope.model = CalendarModel;
    $scope.model.init($sce,
    	function () {
    		$scope.dummyDate = new Date(1900,1,1); //workaround to force refresh
    	}
    );
    $scope.isDateDisabled = $scope.model.isDateDisabled;
    $scope.$watch('selectedcategoriesmodel.rows.length', function(newValue, oldValue) {
    	$scope.model.refresh();
    	if (!_.isUndefined($scope.eventdate)) {
    		$scope.model.getEvents($scope.eventdate);
    	}
    });
    $scope.$watch('eventdate', function(newValue, oldValue) {
    	if (newValue) {
    		$scope.eventdatename = CalendarUtil.toWPDate(newValue);
    		$scope.model.getEvents(newValue);
    	}
    });	
}
