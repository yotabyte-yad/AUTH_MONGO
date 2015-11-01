app.controller("LoginCtrl", function ($location, $scope, $http, $rootScope){
	$scope.login = function(user){
		console.log(user);
		$http.post('/login', user)
		  .success(function(response){
			 $rootScope.currentUser = user;
			 $location.url("profile");
			 
		  });
	}
});