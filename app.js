var buildApp = angular.module('buildApp', ['ngRoute']);

buildApp.config(function($routeProvider){
	$routeProvider
		.when('/',
		{
			controller: 'BuildController',
			templateUrl: 'templates/list.html'
		})
		.otherwise({redirectTo: '/'});
	})
	.controller('BuildController', function($scope, $interval, buildFactory) {
		$scope.buildSucceed = true;
		$scope.buildVisible = true;
		$scope.statusVisible = true;

		$scope.getGlyphClass = function(tile) {	
			if(tile.state == 'running') {
				return 'glyphicon glyphicon-refresh glyphicon-refresh-animate';
			}	
			else if(tile.status == 'SUCCESS') {
				return 'glyphicon glyphicon-ok';
			}
			else if(tile.status == 'FAILURE') {
				return 'glyphicon glyphicon-exclamation-sign';
			}
			return 'glyphicon glyphicon-question-sign';
		}

		$scope.getPanelClass = function(tile){
			if(tile.status == 'SUCCESS') {
				return 'alert alert-dismissible alert-success';
			}
			else if(tile.status == 'FAILURE') {
				return 'alert alert-dismissible alert-danger';
			}

			return 'alert alert-dismissible alert-warning';
		}

		$scope.reload = function() {
			//$scope.statusVisible = true;
			//$scope.buildVisible = !$scope.buildVisible;
		
			if($scope.buildVisible)
			{
				buildFactory.getBuilds()
					.then(function(responses) {
						$scope.buildResponses = responses
							.filter(function(r) { return (r.status == 200 && r.data.build.length > 0)})
							.map(function(r){ return r.data.build[0] })
					})
					.then(buildFactory.getRunningBuilds)
					.then(function(data) {
						if(data.data.build) {
							$scope.runningBuilds = data.data.build.map(function(row) { return row.buildTypeId })
						}
						else {
							$scope.runningBuilds = []
						}
					})
					.then(function() {
						$scope.builds = $scope.buildResponses.map(function(b) { return buildFactory.decodeBuild(b, $scope.runningBuilds); });
						var badChildren = $scope.builds.filter(function(b) { return b.status == 'FAILURE' });
						if(badChildren.length > 0)
						{
							if($scope.buildSucceed == true)
							{
								var audio = new Audio('audio/Jamel.mp3');
								audio.play();
							}
							$scope.buildSucceed = false;
						}
						else
						{
							$scope.buildSucceed = true;
						}
					});
			}
			else{
				buildFactory.getBuilds()
					.then(function(responses) {
						$scope.buildResponses = responses
							.filter(function(r) { return (r.status == 200 && r.data.build.length > 0)})
							.map(function(r){ return r.data.build[0] })
					})
					.then(buildFactory.getRunningBuilds)
					.then(function(data) {
						if(data.data.build) {
							$scope.runningBuilds = data.data.build.map(function(row) { return row.buildTypeId })
						}
						else {
							$scope.runningBuilds = []
						}
					})
					.then(function() {
						$scope.builds = $scope.buildResponses.map(function(b) { return buildFactory.decodeBuild(b, $scope.runningBuilds); });
					})
					.then(function() {
						$scope.tiles = buildFactory.generateTiles($scope.builds)
					})
					.then(function() {
						$scope.statusVisible = false;
					});
				};
			}

			$scope.reload();

			$interval(function () {$scope.reload()}, 10000);
	});
	
	buildApp.directive('checkImage', function($http) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            attrs.$observe('ngSrc', function(ngSrc) {
                $http.get(ngSrc).success(function(){
                    //alert('image exist');
                }).error(function(){
                    //alert('image not exist');
                    element.attr('src', '/images/anonymous.jpg'); // set default image
                });
            });
        }
    };
});
