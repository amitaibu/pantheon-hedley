"use strict";angular.module("clientApp",["ngAnimate","ngCookies","ngSanitize","config","leaflet-directive","LocalStorageModule","ui.router"]).config(["$stateProvider","$urlRouterProvider","$httpProvider",function(a,b,c){var d=["$state","Auth","$timeout",function(a,b,c){b.isAuthenticated()||c(function(){a.go("403")})}];a.state("homepage",{url:"",controller:"HomepageCtrl",resolve:{account:["Account",function(a){return a.get()}]}}).state("login",{url:"/login",templateUrl:"views/login.html",controller:"LoginCtrl"}).state("dashboard",{"abstract":!0,url:"",templateUrl:"views/dashboard/main.html",controller:"DashboardCtrl",onEnter:d,resolve:{account:["Account",function(a){return a.get()}],selectedCompany:["$stateParams",function(a){return a.companyId}]}}).state("dashboard.byCompany",{url:"/dashboard/{companyId:int}","abstract":!0,template:"<ui-view/>",resolve:{mapConfig:["Map",function(a){return a.getConfig()}],authors:["$stateParams","Events",function(a,b){return b.getAuthors(a.companyId)}]}}).state("dashboard.byCompany.events",{url:"/events",templateUrl:"views/dashboard/events/events.html",controller:"EventsCtrl",onEnter:d,resolve:{events:["$stateParams","Events",function(a,b){return b.get(a.companyId)}]}}).state("dashboard.byCompany.byUser",{url:"/user/{userId:int}","abstract":!0,template:"<ui-view/>"}).state("dashboard.byCompany.byUser.events",{url:"/events",templateUrl:"views/dashboard/events/events.html",controller:"EventsCtrl",onEnter:d,resolve:{events:["$stateParams","Events",function(a,b){return b.get(a.companyId,a.userId)}]}}).state("dashboard.byCompany.byUser.events.event",{url:"/event/{eventId:int}",controller:"EventsCtrl"}).state("dashboard.byCompany.events.event",{url:"/event/{eventId:int}",controller:"EventsCtrl"}).state("dashboard.companies",{url:"/companies",templateUrl:"views/dashboard/companies/companies.html",controller:"CompaniesCtrl",onEnter:d,resolve:{companies:["Companies",function(a){return a.get()}]}}).state("dashboard.companies.company",{url:"/{id:int}",templateUrl:"views/dashboard/companies/companies.company.html",controller:"CompaniesCtrl",onEnter:d}).state("dashboard.account",{url:"/my-account",templateUrl:"views/dashboard/account/account.html",controller:"AccountCtrl",onEnter:d,resolve:{account:["Account",function(a){return a.get()}]}}).state("403",{url:"/403",templateUrl:"views/403.html"}),b.otherwise("/"),c.interceptors.push(["$q","Auth","localStorageService",function(a,b,c){return{request:function(a){return a.url.match(/login-token/)||(a.headers={access_token:c.get("access_token")}),a},response:function(a){return a.data.access_token&&c.set("access_token",a.data.access_token),a},responseError:function(c){return 401===c.status&&b.authFailed(),a.reject(c)}}}])}]).run(["$rootScope","$state","$stateParams",function(a,b,c){a.$state=b,a.$stateParams=c}]),angular.module("config",[]).constant("Config",{backend:"http://dev-hedley.pantheon.io"}).value("debug",!0),angular.module("clientApp").controller("CompaniesCtrl",["$scope","companies","$stateParams","$log",function(a,b,c){a.companies=b,a.selectedCompany=null;var d=function(b){a.selectedCompany=null,angular.forEach(a.companies,function(c){c.id==b&&(a.selectedCompany=c)})};c.id&&d(c.id)}]),angular.module("clientApp").controller("EventsCtrl",["$scope","events","authors","mapConfig","$state","$stateParams","$log",function(a,b,c,d,e,f){a.events=b,a.mapConfig=d,a.authors=c,a.selectedAuthorId=null;var g=function(b){a.events[b].select()},h=function(b){a.selectedAuthorId=b};f.eventId&&g(f.eventId),f.userId&&h(f.userId),a.$on("leafletDirectiveMarker.click",function(a,b){var c=f.userId?"dashboard.byCompany.byUser.events.event":"dashboard.byCompany.events.event";e.go(c,{eventId:parseInt(b.markerName)})})}]),angular.module("clientApp").controller("LoginCtrl",["$scope","Auth","$state",function(a,b,c){a.loginButtonEnabled=!0,a.loginFailed=!1,a.login=function(d){a.loginButtonEnabled=!1,b.login(d).then(function(){c.go("homepage")},function(){a.loginButtonEnabled=!0,a.loginFailed=!0})}}]),angular.module("clientApp").service("Auth",["$injector","$rootScope","Utils","localStorageService","Config",function(a,b,c,d,e){this.login=function(b){return a.get("$http")({method:"GET",url:e.backend+"/api/login-token",headers:{Authorization:"Basic "+c.Base64.encode(b.username+":"+b.password)}})},this.logout=function(){d.remove("access_token"),b.$broadcast("clearCache"),a.get("$state").go("login")},this.isAuthenticated=function(){return!!d.get("access_token")},this.authFailed=function(){this.logout()}}]),angular.module("clientApp").service("Utils",function(){var a=this;this.Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(b){var c,d,e,f,g,h,i,j="",k=0;for(b=a.Base64._utf8_encode(b);k<b.length;)c=b.charCodeAt(k++),d=b.charCodeAt(k++),e=b.charCodeAt(k++),f=c>>2,g=(3&c)<<4|d>>4,h=(15&d)<<2|e>>6,i=63&e,isNaN(d)?h=i=64:isNaN(e)&&(i=64),j=j+this._keyStr.charAt(f)+this._keyStr.charAt(g)+this._keyStr.charAt(h)+this._keyStr.charAt(i);return j},_utf8_encode:function(a){a=a.replace(/\r\n/g,"\n");for(var b="",c=0;c<a.length;c++){var d=a.charCodeAt(c);128>d?b+=String.fromCharCode(d):d>127&&2048>d?(b+=String.fromCharCode(d>>6|192),b+=String.fromCharCode(63&d|128)):(b+=String.fromCharCode(d>>12|224),b+=String.fromCharCode(d>>6&63|128),b+=String.fromCharCode(63&d|128))}return b}}}),angular.module("clientApp").service("Events",["$q","$http","$timeout","Config","Marker","$rootScope","$log",function(a,b,c,d,e,f){function g(c,e){var f=c+":"+e,g=a.defer(),i=d.backend+"/api/events",j={sort:"-updated","filter[company]":c};return e&&(j["filter[user]"]=e),b({method:"GET",url:i,params:j,transformResponse:h}).success(function(a){k(f,a),g.resolve(a)}),g.promise}function h(a){var b={};return a=angular.fromJson(a).data,angular.forEach(a,function(a){b[a.id]=a,b[a.id].lat=parseFloat(a.location.lat),b[a.id].lng=parseFloat(a.location.lng),delete a.location,angular.extend(b[a.id],e),b[a.id].unselect()}),b}var i={},j="SkeletonEventsChange";this.get=function(b,c){var d=b+":"+c;return i&&i[d]?a.when(i[d].data):g(b,c)},this.getAuthors=function(b){var c=a.defer(),d={};return this.get(b).then(function(a){angular.forEach(a,function(a){d[a.user.id]={id:parseInt(a.user.id),name:a.user.label,count:d[a.user.id]?++d[a.user.id].count:1}}),c.resolve(d)}),c.promise},this.create=function(c){var e=a.defer(),f=d.backend+"/api/events",g=this;return b({method:"POST",url:f,data:c}).success(function(a){var b=c.company;g.get(b).then(function(c){c.unshift(a.data[0]),k(b,c)}),e.resolve(a.data[0])}),e.promise};var k=function(a,b){i[a]={data:b,timestamp:new Date},c(function(){i.data&&i.data[a]&&(i.data[a]=null)},6e4),f.$broadcast(j)};f.$on("clearCache",function(){i={}})}]),angular.module("clientApp").service("Companies",["$q","$http","$timeout","Config","$rootScope",function(a,b,c,d,e){var f={},g="SkeletonCompaniesChange";this.get=function(){return a.when(f.data||h())};var h=function(){var c=a.defer(),e=d.backend+"/api/companies";return b({method:"GET",url:e}).success(function(a){i(a.data),c.resolve(a.data)}),c.promise},i=function(a){f={data:a,timestamp:new Date},c(function(){f.data=void 0},6e4),e.$broadcast(g)};e.$on("clearCache",function(){f={}})}]),angular.module("clientApp").service("Map",["leafletData",function(a){var b={};this.getConfig=function(){return{zoomControlPosition:"bottomleft",maxZoom:16,minZoom:1,center:this.getCenter()}},this.setCenter=function(a){b.center=a},this.getCenter=function(){return b.center||{lat:60,lng:60,zoom:4}},this.centerMapByMarker=function(b){a.getMap().then(function(a){a.setView(b.getPosition())})}}]),angular.module("clientApp").factory("Marker",["$state","Map",function(a,b){function c(a){return e[a]}var d,e={"default":{iconUrl:"/images/marker-blue.png",shadowUrl:"/images/shadow.png",iconSize:[40,40],shadowSize:[26,26],iconAnchor:[32,30],shadowAnchor:[25,7]},selected:{iconUrl:"/images/marker-red.png",shadowUrl:"/images/shadow.png",iconSize:[40,40],shadowSize:[26,26],iconAnchor:[32,30],shadowAnchor:[25,7]}};return{unselect:function(){this.icon=c("default")},select:function(){angular.isDefined(d)&&d.unselect(),d=this,this.icon=c("selected"),b.centerMapByMarker(this)},getPosition:function(){return{lat:this.lat,lng:this.lng}}}}]),angular.module("clientApp").controller("DashboardCtrl",["$scope","account","selectedCompany","Auth","$state","$log",function(a,b,c,d,e){a.companies=b.companies,a.selectedCompany=c?c:parseInt(b.companies[0].id),a.logout=function(){d.logout(),e.go("login")}}]),angular.module("clientApp").directive("spinner",function(){return{template:'<div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>',restrict:"E"}}),angular.module("clientApp").controller("AccountCtrl",["$scope","account",function(a,b){a.account=b}]),angular.module("clientApp").service("Account",["$q","$http","$timeout","Config","$rootScope","$log",function(a,b,c,d,e){function f(){var c=a.defer(),e=d.backend+"/api/me/";return b({method:"GET",url:e,transformResponse:g}).success(function(a){i(a[0]),c.resolve(a[0])}),c.promise}function g(a){return(a=angular.fromJson(a).data)?(angular.forEach(a[0].companies,function(b,c){a[0].companies[c].id=parseInt(b.id)}),a):void 0}var h={};this.get=function(){return a.when(h.data||f())};var i=function(a){h={data:a,timestamp:new Date},c(function(){h={}},6e4),e.$broadcast("gb.account.changed")};e.$on("clearCache",function(){h={}})}]),angular.module("clientApp").controller("HomepageCtrl",["$scope","$state","account","$log",function(a,b,c){if(c){var d=parseInt(c.companies[0].id);b.go("dashboard.byCompany.events",{companyId:d})}else b.go("login")}]);