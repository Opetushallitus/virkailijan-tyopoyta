"use strict";

var app = angular.module('virkailijan-stp', ['ngHtmlCompile','ngResource', 'ngSanitize', 'truncate', 'loading', 'ngRoute', 'ng-breadcrumbs', 'ngAnimate', 'localization', 'ui.bootstrap','ui.bootstrap.tpls','ui.bootstrap.transition', 'ui.utils', 'ngIdle', 'pasvaz.bindonce', 'ngUpload']);
//
// i18n toteutus kopioitu osittain http://jsfiddle.net/4tRBY/41/
//

angular.module('localization', []).filter('i18n', [ '$rootScope', '$locale', function($rootScope, $locale) {
    var localeMapping = {
        "en-us" : "en_US",
        "fi-fi" : "fi_FI",
        "sv-se" : "sv-SE"
    };

    jQuery.i18n.properties({
        name : 'messages',
        path : '../i18n/',
        mode : 'map',
        language : localeMapping[$locale.id],
        callback : function() {
        }
    });

    return function(text) {
        return jQuery.i18n.prop(text);
    };
} ]);

var AUTH_URL_BASE = AUTH_URL_BASE || "<virkailijan-stp-ui.authentication-service-url>";
var SERVICE_URL_BASE = SERVICE_URL_BASE || "<virkailijan-stp-ui.rajapinnat-service-url.rest>";
var WP_API_BASE = WP_API_BASE || "<virkailijan-stp-ui.wp-api-url>";
var TEMPLATE_URL_BASE = TEMPLATE_URL_BASE || "";
var CAS_URL = CAS_URL || "<valintalaskenta-ui.cas.url>";
var SESSION_KEEPALIVE_INTERVAL_IN_SECONDS = SESSION_KEEPALIVE_INTERVAL_IN_SECONDS || 30;
var MAX_SESSION_IDLE_TIME_IN_SECONDS = MAX_SESSION_IDLE_TIME_IN_SECONDS || 1800;

app.factory('NoCacheInterceptor', function() {
    return {
        request : function(config) {
            if (config.method && config.method == 'GET' && config.url.indexOf('html') === -1) {
                var separator = config.url.indexOf('?') === -1 ? '?' : '&';
                config.url = config.url + separator + 'noCache=' + new Date().getTime();
            }
            return config;
        }
    };
});
// Route configuration


app.config([ '$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
	$httpProvider.interceptors.push('NoCacheInterceptor');

	$httpProvider.interceptors.push(function($q) {
	    var realEncodeURIComponent = window.encodeURIComponent;
	    return {
	      'request': function(config) {
	         window.encodeURIComponent = function(input) {
	           return realEncodeURIComponent(input).split("%3Csearch_for_all%3E").join("+"); 
	         }; 
	         return config || $q.when(config);
	      },
	      'response': function(config) {
	         window.encodeURIComponent = realEncodeURIComponent;
	         return config || $q.when(config);
	      }
	    };
	  });
	
		var routeParameters =  {
		etusivu   : { controller : PostsController,
					  templateUrl : TEMPLATE_URL_BASE + 'desktop/posts.html',
					  label: 'desktop' },
		tiedote   : { controller : ViewAnnouncementController,
		       		  templateUrl : TEMPLATE_URL_BASE + 'announcement/announcement.html',
		       		  label: 'announcements' },
		tapahtuma : { controller : ViewEventController,
	        		  templateUrl : TEMPLATE_URL_BASE + 'event/event.html',
	        		  label: 'events' },
	    kalenteri : { controller : ViewCalendarController,
	        		  templateUrl : TEMPLATE_URL_BASE + 'calendar/calendar.html',
	        		  label: 'calendar' },
	    materiaali: { controller : ViewMaterialController,
	        		  templateUrl : TEMPLATE_URL_BASE + 'material/material.html',
	        		  label: 'materials' },
	    arkisto   : { controller : ArchiveController,
	        		  templateUrl : TEMPLATE_URL_BASE + 'archive/archive.html',
	        		  label: 'archive' }
	}
    
    $routeProvider.when('/etusivu', routeParameters.etusivu)
    .when('/etusivu/tiedote/:tiedoteid', routeParameters.tiedote)
    .when('/etusivu/tapahtuma/:tapahtumaid', routeParameters.tapahtuma)
    .when('/etusivu/materiaali/:materiaaliid', routeParameters.materiaali)
    .when('/etusivu/kalenteri/', routeParameters.kalenteri)
    .when('/etusivu/arkisto',  routeParameters.arkisto)
    .when('/etusivu/arkisto/tiedote/:tiedoteid',  routeParameters.tiedote)
    .when('/etusivu/arkisto/materiaali/:materiaaliid',  routeParameters.materiaali)
    .otherwise({
    	redirectTo : '/etusivu'
    });
} ]);

app.factory('Profiles', function($resource) {
	
    return $resource(SERVICE_URL_BASE + "session/defaultprofile", {}, {
        post: {
        		method:   "POST",
                interceptor: {
                    responseError: function (data) {
                        console.log('error fetching Profiles');
                    }
               },
        	   isArray : true}
    });
});

app.factory('UserOrganisations', function($resource) {
    return $resource(AUTH_URL_BASE + "omattiedot/organisaatiohenkilo", {}, {
        get: { 
        		method:   "GET",
                interceptor: {
                    responseError: function (data) {
                        console.log('error fetching UserOrganisations');
                    }
                },
                isArray : true} 
    });
});

app.factory('LatestAnnouncements', function($resource) {
    return $resource(WP_API_BASE +"get_posts", {}, {
        get : {
            method : "GET",
            interceptor: {
                responseError: function (data) {
                    console.log('error fetching LatestAnnouncements');
                }
            },
            isArray : false,
            params : { 	count : "-1",
            			exclude : "content,comments,attachments,comment_count,comment_status,custom_fields,excerpt,status,url,slug,type" }
        }
    });
});

app.factory('Announcement', function($resource) {
    return $resource(WP_API_BASE+"get_post", {}, {
        get : {
            method : "GET",
            interceptor: {
                responseError: function (data) {
                    console.log('error fetching Announcement');
                }
            },
            isArray : false
        }
    });
});

app.factory('TextSearchAnnouncements', function($resource) {
    return $resource(WP_API_BASE +"get_search_results", {}, {
        get : {
            method : "GET",
            isArray : false,
            interceptor: {
                responseError: function (data) {
                    console.log('error fetching TextSearchAnnouncements');
                }
            },
            params : { post_type : "post",
     		   		   count : "-1",
            	 	   exclude : "content,comments,attachments,comment_count,comment_status,custom_fields,excerpt,status,url,slug,type" }
        }
    });
});

app.factory('Events', function($resource) {
    return $resource(WP_API_BASE+"events/get_recent_events", {}, {
        get : {
            method : "GET",
            isArray : false,
            interceptor: {
                responseError: function (data) {
                    console.log('error fetching Events');
                }
            },
            params : { count : "-1" }
        }
    });
})

app.factory('Event', function($resource) {
    return $resource(WP_API_BASE+"event/get_event", {}, {
        get : {
            method : "GET",
            interceptor: {
                responseError: function (data) {
                    console.log('error fetching Event');
                }
            },
            isArray : false
        }
    });
})

app.factory('LatestMaterials', function($resource) {
    return $resource(WP_API_BASE +"get_posts", {}, {
        get : {
            method : "GET",
            interceptor: {
                responseError: function (data) {
                    console.log('error fetching LatestMaterials');
                }
            },
            isArray : false,
            
            params : { post_type : "page",
    	   			   count : "-1",
            		   exclude : "content,comments,attachments,comment_count,comment_status,custom_fields,excerpt,status,url,slug,type" }
        }
    });
})

app.factory('TextSearchMaterials', function($resource) {
    return $resource(WP_API_BASE +"get_search_results", {}, {
        get : {
            method : "GET",
            interceptor: {
                responseError: function (data) {
                    console.log('error fetching TextSearchMaterials');
                }
            },
            isArray : false,
            params : { post_type : "page",
            		   count : "-1",
            	       exclude : "content,comments,attachments,comment_count,comment_status,custom_fields,excerpt,status,url,slug,type" }
        }
    });
});

app.factory('Material', function($resource) {
    return $resource(WP_API_BASE+"get_post", {}, {
        get : {
            method : "GET",
            interceptor: {
                responseError: function (data) {
                    console.log('error fetching Material');
                }
            },
            isArray : false,
            params : { post_type : "page" }
        }
    });
})

app.factory('Categories', function($resource) {
    return $resource(WP_API_BASE +"get_category_index", {}, {
        get : {
            method : "GET",
            interceptor: {
                responseError: function (data) {
                    console.log('error fetching Categories');
                }
            },
            isArray : false,
        }
    });
})

app.factory('Tags', function($resource) {
    return $resource(WP_API_BASE +"get_tag_index", {}, {
        get : {
            method : "GET",
            interceptor: {
                responseError: function (data) {
                    console.log('error fetching Tags');
                }
            },
            isArray : false,
        }
    });
})

app.factory('SessionPoll', function($resource) {
    return $resource(SERVICE_URL_BASE + "session/maxinactiveinterval", {}, {
        get: {
        		method:   "GET",
                interceptor: {
                    responseError: function (data) {
                        console.log('error fetching SessionPoll');
                    }
                }
        	}
    });
});

app.filter('naturalSort', function() {
    return function(arrInput, field, reverse) {
        var arr = arrInput.sort(function(a, b) {
            var valueA = field ? a[field] : a;
            var valueB = field ? b[field] : b;
            var aIsString = typeof valueA === 'string';
            var bIsString = typeof valueB === 'string';
            return naturalSort(aIsString ? valueA.trim().toLowerCase() : valueA, bIsString ? valueB.trim().toLowerCase() : valueB);
        });
        return reverse ? arr.reverse() : arr;
    };
});

function getLanguageSpecificValue(fieldArray, fieldName, language) {
    if (fieldArray) {
        for (var i = 0; i < fieldArray.length; i++) {
            if (fieldArray[i].kieli === language) {
                var result = eval("fieldArray[i]." + fieldName);
                return result == null ? "" : result;
            }
        }
    }
    return "";
}

function getLanguageSpecificValueOrValidValue(fieldArray, fieldName, language) {
    var specificValue = getLanguageSpecificValue(fieldArray, fieldName, language);

    if (specificValue == "" && language != "FI"){
        specificValue = getLanguageSpecificValue(fieldArray, fieldName, "FI");
    }
    if (specificValue == "" && language != "SV"){
        specificValue = getLanguageSpecificValue(fieldArray, fieldName, "SV");
    }
    if (specificValue == "" && language != "EN"){
        specificValue = getLanguageSpecificValue(fieldArray, fieldName, "EN");
    }
    return specificValue;
}

function preFormattedHtml(text) {
	return "<pre style=\"font-family: arial; word-break: normal;\">"+text+"</pre>"
}

app.filter('filterTags', [function() {
    return function(input, tag) {
    	tag.rows = [];
    	if(tag.slug.length==0) {
    		_(input).forEach(function(row) {
            	if(row.tags.length==0) {
            		tag.rows.push(row);
            	}
    		});
    	} else {
	    	_(input).forEach(function(row) {
	        	if( _(row.tags).map("slug").contains(tag.slug)) {
	        		tag.rows.push(row);
	        	}
			});
    	}
        return tag.rows;
    };
}])

// Pagination
app.filter('startFrom', [function() {
    return function(input, start) {
        start = +start; //parse to int
        var returnValue = 0;
        if(start > -1 && input && Object.prototype.toString.call( input ) === '[object Array]' ) {
            returnValue = input.slice(start);
        }
        return returnValue;
    };
}])

// Forloop for angularjs
app.filter('forLoop', function() {
    return function(input, start, end) {
        input = new Array(end - start);
        for (var i = 0; start < end; start++, i++) {
            input[i] = start;
        }
        return input;
    };
});

app.run(["SessionPoll", function(SessionPoll) {
    SessionPoll.get({});
}]);

function toDate(enDateString) {
	var frags = enDateString.match(/^(\d{4})-(\d{2})-(\d{2})\s*.*$/);
	return new Date(frags[1]+"/"+frags[2]+"/"+frags[3]);
}

function toFinnishDate(enDateString) {
	var myDate = toDate(enDateString);
	return myDate.getDate()+"."+(myDate.getMonth()+1)+"."+myDate.getFullYear();
}
app.filter('toFinnishDate', function() {
	return function(enDateString) {
		if (_.isUndefined(enDateString)) {
			return "";
		}
		return toFinnishDate(enDateString);
	};
});

app.filter('toFinnishDateTime', function() {
	return function(enDateString) {
		if (_.isUndefined(enDateString)) {
			return "";
		}
		var i=enDateString.indexOf(" ");
		return toFinnishDate(enDateString)+enDateString.substring(i, i+6);
	};
});

var INITIALLINES=5;
var SHOWMORELINES=5;
var PAGESIZE=10;

function UIListModel(populator) {
	var model;
   	model = new function() {
   		this.pagesize = PAGESIZE;
   		this.params = {};
   		this.alerts = [];
   		this.ready=false;
   		this.pagenr = 1;
   		this.setPagenr = function(pagenr) {
   			if (pagenr>0) {
   				model.pagenr = pagenr;
   			}
   	    	if ((model.pagenr-1)*model.pagesize>model.rows.length) {
   	    		model.pagenr =  Math.floor(model.rows.length/model.pagesize) + 1;
   	    	}
   		}
   		this.setParams = function(params) {
   			model.params = params;
   			model.populate(false);
   			return model;
        }
        this.hasalerts = function() {
        	return model.alerts.length>0;
        }
        this.maxlines = function() {
        	return model.maxlines;
        }
        this.showmore = function() {
        	model.maxlines += SHOWMORELINES;
        }
        this.refresh = function() {
        	model.populate(true);
        }
        this.transform = function(rows) {
        	return rows;
        }
        this.loadSuccess = function(rows) {
        	if (rows) {
        		model.rows = model.transform(rows);
        	}
        	model.setPagenr(-1);
        	model.ready = true;
        }
        this.loadError = function(error) {
        	model.alerts.push(error);
        	model.ready = true;
        }
        this.populate = function(force) {
        	model.ready = false;
        	model.alerts = [];
        	model.rows = [];
        	model.maxlines = INITIALLINES;
        	populator.load(model.loadSuccess, model.loadError, force, model.params);
        };
   	};
   	return model;
}

var UIFilterModel = function(populator) {
	var model = UIListModel(populator);
	model.filtergroups= [];
	model.addFilter = function(filter, group) {
		if (!model.filtergroups[group]) {
			model.filtergroups[group] = [];
		}
			model.filtergroups[group].push(filter);
		if (model.ready) {
			model.populate(false);
		}
		return model;   			
	}
	model.removeFilter = function(filter, group) {
		model.filtergroups[group].remove(filter);
		if (model.ready) {
			model.populate(false);
		}	   			
		return model;
    }
	model.clicked = function(el, group) {
		if (el.checked) {
			model.addFilter(el.f, group);
		} else {
			model.removeFilter(el.f, group);
		}
	}
	model.transform = function(rows) {
		if (model.filtergroups.length==0) {
//			no filters : return all
			return rows;
		}
    	var _rows =[];
    	var hit = false;
//    matches := <filtergroup_1> AND <filtergroup_2> AND ... AND <filtergroup_n>
//    <filtergroup_n> := <filter_1_in_filtergroup_n> OR <filter_2_in_filtergroup_n> OR ... OR <filter_y_in_filtergroup_n>
// 	  plain text explanation:
//    row is to to be selected to the result, if row has at least one ("OR") hit in each ("AND") filtergroup
    	$(rows).each(function(i, row) {
    		hit = true;
    		$(model.filtergroups).each(function(i, filtergroup) {
    			$(filtergroup).each(function(i, filter) {
    				if (hit = filter(row)) {
    					return false; // "break"
    				}
    			});
    			if (!hit) { //one hit required for each group
    				return false; // "break"
    			}
    		});
    		if (hit) {
    			_rows.push(row);
    		}
    	});
    	return _rows;
	}
	return model;
};

var PostResultValidator = function() {
	this.valid = function(result) {
		return result.status == "ok";
	}
	this.result = function(result) {
		return result.posts;
	}
	this.error = function(result) {
		return result.error;
	}
};

var ModelPopulator = function(resource, errorMessage, resultValidator) {
	errorMessage =  errorMessage || "Unknown populator error.";
	resultValidator = resultValidator || new PostResultValidator;
	var populator;
		populator = new function() {
		    this.load = function(loadSuccess, loadError, force, params) {
		    	if (!force && populator.cache && JSON.stringify(populator.params) ==  JSON.stringify(params)) {
		    		loadSuccess(populator.cache);	//load rows from cache
		    	} else {
		    		populator.cache = null;
		    		resource.get(params, function(result) {
		    			if (resultValidator.valid(result)) {
		    				populator.cache = resultValidator.result(result);
		    				populator.params = params;
				        	loadSuccess(populator.cache); 
		    			} else {
		    				loadError({ msg : resultValidator.error(result) });
		    			}
		    		}, function(error) {
		    			var alert = { msg: errorMessage }
				        loadError(alert);
				    });
		    	}
		    };
		};
	return populator;
};

Object.defineProperty(Array.prototype, "remove", {
    enumerable: false,
    value: function (item) {
        var removeCounter = 0;
        for (var index = 0; index < this.length; index++) {
            if (this[index] === item) {
                this.splice(index, 1);
                removeCounter++;
                index--;
            }
        }
        return removeCounter;
    }
});

Object.defineProperty(Array.prototype, "contains", {
    enumerable: false,
    value: function (k) {
  	  for(var i=0; i < this.length; i++){
  	    if(this[i] === k){
  	      return true;
  	    }
  	  }
  	  return false;
    }
});

app.directive('stpBreadcrumb', function() {
	return {
		template: 
			"<div class=\"row\">"+
			"	<div class=\"col-xs-12\">"+
			"		<ul class=\"breadcrumb\" style=\"background-color: white\">"+
			"			<li>"+
			"				<a href=\"#/etusivu\" class=\"link\"> "+
			"					<span class=\"icon-breadcrumb-home\"></span>"+
			"				</a>"+
			"			</li>"+
			"			<li	ng-repeat=\"breadcrumb in breadcrumbs.get() track by breadcrumb.path\">"+
			"				<a href=\"#{{ breadcrumb.path }}\" ng-if=\"!$last\"> "+
			"					<span>"+
			"						&nbsp;&gt; {{'breadcrumb.'+breadcrumb.label | i18n}} "+
			"					</span>"+
			"				</a> "+
			"				<span ng-if=\"$last\">"+
			"					 &nbsp;&gt; {{'breadcrumb.'+breadcrumb.label  | i18n}} "+
			"				</span>"+
			"			</li>"+
			"		</ul>"+
			"	</div>"+
			"</div>"			
	};
});

app.directive('stpGoback', function() {
	return {
		template:
   	"<div class=\"row-fluid\">"+
		"<a href=\"#{{(breadcrumbs.get()[breadcrumbs.get().length-2]).path}}\" class=\"link\">"+
			"<span>{{'generic.goback' | i18n}}</span>"+
		"</a>"+
	"</div>"
	};
});
		
app.directive('indeterminateCheckbox', [function() {
    return {
        scope: true,
        require: '?ngModel',
        link: function(scope, element, attrs, modelCtrl) {
        	var f = function() {
        		scope.$apply(function () {
        			var isChecked = element.prop('checked');
        			
        			// Set each child's selected property to the checkbox's checked property
        			angular.forEach(scope.$eval(childList), function(child) {
        				child[property] = isChecked;
        			});
        		});
        	}
            var childList = attrs.childList;
            var property = attrs.property;
         // Bind the onChange event to update children
            element.bind('click', f);  // IE requires : deselecting parent won't deselect selected children otherwise
			element.bind('change', f);
			
			// Watch the children for changes
			scope.$watch(childList, function(newValue) {
				var hasChecked = false;
				var hasUnchecked = false;
				
				// Loop through the children
				angular.forEach(newValue, function(child) {
					if (child[property]) {
						hasChecked = true;
					} else {
						hasUnchecked = true;
					}
				});
				
				// Determine which state to put the checkbox in
				if (hasChecked && hasUnchecked) {
					element.prop('checked', false);
					element.prop('indeterminate', true);
                    if (modelCtrl) {
                        modelCtrl.$setViewValue(false);
                    }
				} else {
					element.prop('checked', hasChecked);
					element.prop('indeterminate', false);
                    if (modelCtrl) {
					    modelCtrl.$setViewValue(hasChecked);
                    }
				}
			}, true);
		}
	};
}]);