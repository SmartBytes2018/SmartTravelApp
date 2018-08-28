angular.module('myApp', ['ionic', 'nfcFilters', 'ngMaterial', 'ngAnimate', 'ngSanitize'])

    .controller('AppCtrl', function ($scope, nfcService, $scope, $timeout, $mdSidenav, $mdDialog, $window) {
        $scope.tag = nfcService.tag;
        $scope.showSmartcards = false;
        $scope.showPayment = false;
        $scope.showSearch = true;
        $scope.isEntry = true;
        $scope.showMap = false;
    $scope.showUser = false;
    $scope.mobileNumber = "";
    $scope.showWallet = false;
    
    $scope.selectedTrip = null;
        $scope.showTripBtn = false;
        $scope.map = new google.maps.Map(
                document.getElementById('map'), {zoom: 10, center: {lat: 12.9427603, lng: 77.6920312}});
        $scope.directionsService = "";
        $scope.directionsDisplay = "";
        $scope.location = {
                origin: "",
                destination: ""
        };
        $scope.availableRoutes = [];
        $scope.toggleSidenav = buildToggler('closeEventsDisabled');
        $scope.$on('nfcScanned', function (event, data) {
            $window.alert(JSON.stringify(data)); 
        });

        // "data" is the message sent by reader (type of reader)
        $scope.$on('nfcMimeScanned', function (event, data) {
            $scope.selectCard(data);
            $scope.isEntry = !$scope.isEntry;
        });

        $scope.availableCash = 1240;
        $scope.availableCards = [{
            name: 'Namma Metro',
            providers: [],
            showProviders: false
        },
        {
            name: 'Bus - BMTC',
            providers: [],
            showProviders: false
        },
        {
            name: 'Food court',
            providers: [],
            showProviders: false
        }, {
            name: 'Cinemas',
            providers: ['PVR', 'INOX'],
            showProviders: false
        }, {
            name: 'Amsument Park',
            providers: [],
            showProviders: false
        }];
        $scope.myTransactions = [
            {action: 'spent', amount: 40, based: 'Namma Metro', date: '04 August 2018 10:08', id: '08W5438790'},
		    {action: 'spent', amount: 10, based: 'BMTC', date: '01 August 2018 15:37', id: '785G87J879'}, 
            {action: 'spent', amount: 60, based: 'Namma Metro', date: '11 July 2018 01:10', id: '878KJKG865'},
            {action: 'spent', amount: 10, based: 'BUS - bmtc', date: '02 July 2018 08:16', id: 'ASF7649596'}
        ];
        $scope.selected = [];
        $scope.mySelectedCards = [];
        $scope.msg = "";
        $scope.transactionMsg = {action: '', amount: 0, based: '', date: '', id: 'D98235F12'};
        $scope.showAlert = function(msg) {
            $mdDialog.show(
            $mdDialog.alert()
                .clickOutsideToClose(true)
                .htmlContent(msg)
                .ok('Got it!')
            );
        }
        $scope.selectCard = function (data) {
            var gateData = data.split(',');
            var cardType = gateData[0].toUpperCase().trim();
            var serviceProvider = gateData[1].toUpperCase().trim();
            var stationCode = gateData[2].toUpperCase().trim();
            var gateType = gateData[3].toUpperCase().trim();
            var fare;
            switch(cardType) {
                case 'bus'.toUpperCase():
                    if (gateType === 'E'.toUpperCase()) {
                        $scope.msg = "Welcome to " + serviceProvider + " bus service. <br /> <br />You have boarded at <b>" + stationCode + "</b> bus stop";
                        $scope.showAlert($scope.msg);
                    } else if (gateType === 'X'.toUpperCase()) {
                        fare = gateData[4].toUpperCase().trim();
                        $scope.msg = "Thanks for choosing " + serviceProvider + " bus service. <br /><br />You have arrived at <b>" + stationCode + "</b> bus stop. <br /><br /> Your wallet has been charged <b>" + fare + "</b> for this journey";
                        $scope.availableCash = $scope.availableCash - 40;
                        $scope.transactionMsg.action = 'spent';
                        $scope.transactionMsg.amount = 40;
                        $scope.transactionMsg.based = serviceProvider + ' Bus';
                        $scope.transactionMsg.date = new Date().toDateString().substring(4, new Date().toDateString().length).toString() +' '+ new Date().toTimeString().substring(0, 5).toString();
                        $scope.myTransactions.splice(0, 0, $scope.transactionMsg);
                        $scope.showAlert($scope.msg);
                    }
                    break;
                case 'metro'.toUpperCase():
                    if (gateType === 'E'.toUpperCase()) {
                        $scope.msg = "Welcome to " + serviceProvider + ". <br /> <br />You have boarded at <b>" + stationCode + "</b> station";
                        $scope.showAlert($scope.msg);
                    } else if (gateType === 'X'.toUpperCase()) {
                        fare = gateData[4].toUpperCase().trim();
                        $scope.msg = "Thanks for choosing " + serviceProvider + ". <br /><br />You have arrived at <b>" + stationCode + "</b> station. <br /><br /> Your wallet has been charged <b>" + fare + "</b> for this journey";
                        $scope.availableCash = $scope.availableCash - 40;
                        $scope.transactionMsg.action = 'spent';
                        $scope.transactionMsg.amount = 40;
                        $scope.transactionMsg.based = serviceProvider + ' Metro';
                        $scope.transactionMsg.date = new Date().toDateString().substring(4, new Date().toDateString().length).toString() +' '+ new Date().toTimeString().substring(0, 5).toString();
                        $scope.myTransactions.splice(0, 0, $scope.transactionMsg);
                        $scope.showAlert($scope.msg);
                    }
                    break;
            } 
        };
        
        $scope.fnShowMaps = function (evt) {
		$scope.availableRoutes = [];
            $scope.showMap = true;		
            $scope.directionsService = new google.maps.DirectionsService;
            $scope.directionsDisplay = new google.maps.DirectionsRenderer;
            //var currentPosition = navigator.geolocation.getCurrentPosition($scope.showPosition);		
            // The marker, positioned at Uluru
            $scope.directionsDisplay.setMap($scope.map);
            
            $scope.directionsService.route({
                origin: $scope.location.origin,
                destination: $scope.location.destination,
                travelMode: 'TRANSIT',
                provideRouteAlternatives: true,
                transitOptions: {
                    modes: ['BUS', 'RAIL', 'SUBWAY', 'TRAIN', 'TRAM']
                }
                }, function(response, status) {
                    console.log(JSON.stringify(response));
                if (status === 'OK') {
                    $scope.availableRoutes = [];
                    for (var i = 0; i < response.routes.length; i++) {
                        $scope.availableRoutes.push(response.routes[i])
                        var dr = new google.maps.DirectionsRenderer();
                        dr.setDirections(response);
                        // Tell the DirectionsRenderer which route to display
                        dr.setRouteIndex(i);
                        dr.setMap($scope.map);
                    }
                    $scope.directionsDisplay.setDirections(response);
                    $scope.directionsDisplay.setMap($scope.map);
                    $scope.$apply();
                } else {
                    window.alert('Directions request failed due to ' + status);
                }
                });
        };

        $scope.showButton = function(index) {
		console.log($scope.showTripBtn);
            $scope.showTripBtn = true;
            $scope.selectedTrip = index;
        };
    
        $scope.itemNumber = function (val) {
            var scCount = 0;
            angular.forEach(val, function(value, key){
                if(value.travel_mode !== "WALKING")
                    scCount++;
            });
            return scCount;
        };
	
        $scope.manageExpandCollapse = function (item, index) {
            item.showDetails = item.showDetails ? false : true;
            for (var i=0; i < $scope.availableRoutes.length; i++) {
                if (i != index) {
                    $scope.availableRoutes[i].showDetails = false;
                }
            }
        };
        
	$scope.deletePass = function (index, name, ev) {
		var confirm = $mdDialog.confirm()
        .title('Confirmation')
        .htmlContent('Are you sure want to remove <b>'+ name +'</b> pass?')
        .ariaLabel('Lucky day')
        .targetEvent(ev)
        .ok('Confirm')
        .cancel('Cancel');
		$mdDialog.show(confirm).then(function() {
			$scope.mySelectedCards.splice(index,1);
	    });
	};
	$scope.tripSubscribe = function (ev) {
		console.log($scope.selectedTrip);
		var availablePasses = [];
		var passDetails = "";
		for (var i=0; i < $scope.availableRoutes[$scope.selectedTrip].legs[0].steps.length;i++) {
			if ($scope.availableRoutes[$scope.selectedTrip].legs[0].steps[i].travel_mode !== 'WALKING') {
				passDetails = $scope.availableRoutes[$scope.selectedTrip].legs[0].steps[i].transit.line.agencies[0].name + " - " + $scope.availableRoutes[$scope.selectedTrip].legs[0].steps[i].transit.line.vehicle.name;
				if (availablePasses.indexOf(passDetails) < 0) {
					availablePasses.push(passDetails);
				}
			}
		}
		var confirm = $mdDialog.confirm()
        .title('Confirmation')
        .htmlContent('Are you sure want to subscribe for the <b>'+availablePasses+'</b> services?')
        .ariaLabel('Lucky day')
        .targetEvent(ev)
        .ok('YES')
        .cancel('No');
		$mdDialog.show(confirm).then(function() {
			for (var i = 0; i < availablePasses.length; i++) {
				$scope.addedAlready = false;
				for (var j=0; j < $scope.mySelectedCards.length; j++) {
					if ($scope.mySelectedCards[j].name === availablePasses[i]) {
						$scope.addedAlready = true;
						break;
					}
				}
				if (!$scope.addedAlready) {
					$scope.selectedPasses = {
							name: availablePasses[i],
							providers: [],
							showProviders: false
					};
					$scope.mySelectedCards.push($scope.selectedPasses);
				}				
			};
			$scope.showHidecards(true, 'C');
	    }, function() {
	    	$scope.mySelectedCards = [];
	    });
	};
	
        $scope.subscribe = function (ev) {
            var confirm = $mdDialog.confirm()
        .title('Confirmation')
            .textContent('Are you sure want to subscribe for the selected services?')
            .ariaLabel('Lucky day')
            .targetEvent(ev)
            .ok('YES')
        .cancel('No');
            $mdDialog.show(confirm).then(function() {
                $scope.mySelectedCards = $scope.selected;
            }, function() {
                $scope.mySelectedCards = [];
            });    
        };

        $scope.toggle = function (item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) {
            list.splice(idx, 1);
            }
            else {
            list.push(item);
            }
        };

        $scope.exists = function (item, list) {
            return list.indexOf(item) > -1;
        };
        
        function buildToggler(componentId) {
            return function() {
                $mdSidenav(componentId).toggle();
            };
        }
        
        $scope.openItem = function(item) {
            $scope.availableCards[item].showProviders = $scope.availableCards[item].showProviders ? false : true;
        }
        
        $scope.showHidecards = function(val, type) {
                $scope.showPayment = false;
                $scope.showSmartcards = val;
            if (type === 'H') {
                $scope.showSearch = true;
                $scope.showMap = false;
                $scope.showTripBtn = false;
    		$scope.location = {
    				origin: "",
    				destination: ""
    		};
    		$scope.selectedTrip = null;
            } else {
                $scope.showSearch = false;
            }
            $mdSidenav('closeEventsDisabled').close();
        }
            
        $scope.fnShowPayment = function(val) {
            $scope.showPayment = true;
            $mdSidenav('closeEventsDisabled').close();
    }
    $scope.fnUser = function(val) {
    	$scope.showUser = true;
    	$mdSidenav('closeEventsDisabled').close();
    }
        $scope.setupPlaceChangedListener = function(autocomplete, mode) {
            var me = this;
            autocomplete.bindTo('bounds', this.map);
            autocomplete.addListener('place_changed', function() {
                var place = autocomplete.getPlace();
                if (!place.place_id) {
                window.alert("Please select an option from the dropdown list.");
                return;
                }
                if (mode === 'ORIG') {
                    $scope.location.origin = place.name;
                } else {
                    $scope.location.destination = place.name;
                }
            });
        };

        $scope.disableTap = function(id){
            container = document.getElementsByClassName('pac-container');
            // disable ionic data tab
            angular.element(container).attr('data-tap-disabled', 'true');
            var backdrop = document.getElementsByClassName('backdrop');
            angular.element(backdrop).attr('data-tap-disabled', 'true');
            // leave input field if google-address-entry is selected
            angular.element(container).on("click", function(){
                document.getElementById(id).blur();
            });
        };

        $scope.originInput = document.getElementById('origin');
        $scope.destinationInput = document.getElementById('destination');
        var originAutocomplete = new google.maps.places.Autocomplete(
                $scope.originInput, {placeIdOnly: true});
        var destinationAutocomplete = new google.maps.places.Autocomplete(
                $scope.destinationInput, {placeIdOnly: true});
        $scope.setupPlaceChangedListener(originAutocomplete, 'ORIG');
        $scope.setupPlaceChangedListener(destinationAutocomplete, 'DEST');
        document.getElementById('origin').placeholder = "";
        document.getElementById('destination').placeholder = "";
    })
    .factory('nfcService', function ($rootScope, $ionicPlatform) {

        var tag = {};

        $ionicPlatform.ready(function() {
            nfc.addTagDiscoveredListener(function (nfcEvent) {
                console.log(JSON.stringify(nfcEvent.tag, null, 4));
                $rootScope.$apply(function(){
                    angular.copy(nfcEvent.tag, tag);
                    // if necessary $state.go('some-route')
                });
                $rootScope.$broadcast('nfcScanned', nfcEvent.tag);
            }, function () {
                console.log("Listening for NDEF Tags.");
            }, function (reason) {
                alert("Error adding NFC Listener " + reason);
            });

            nfc.addMimeTypeListener("text/pg", function (nfcEvent) {
                console.log(JSON.stringify(nfcEvent.tag, null, 4));
                $rootScope.$broadcast('nfcMimeScanned', decodePayload(nfcEvent.tag.ndefMessage[0]));
            }, function () {
                console.log("Listening for NDEF Tags.");
            }, function (reason) {
                alert("Error adding NFC Listener " + reason);
            });

        });

        // ideally some form of this can move to phonegap-nfc util
        function decodePayload(record) {
            var recordType = nfc.bytesToString(record.type),
                payload;

            // TODO extract this out to decoders that live in NFC code
            // TODO add a method to ndefRecord so the helper 
            // TODO doesn't need to do this

            if (recordType === "T") {
                var langCodeLength = record.payload[0],
                text = record.payload.slice((1 + langCodeLength), record.payload.length);
                payload = nfc.bytesToString(text);

            } else if (recordType === "U") {
                var identifierCode = record.payload.shift(),
                uri =  nfc.bytesToString(record.payload);

                if (identifierCode !== 0) {
                    // TODO decode based on URI Record Type Definition
                    console.log("WARNING: uri needs to be decoded");
                }
                //payload = "<a href='" + uri + "'>" + uri + "<\/a>";
                payload = uri;

            } else {

                // kludge assume we can treat as String
                payload = nfc.bytesToString(record.payload); 
            }

            return payload;
        }

        return {
            tag: tag,

            clearTag: function () {
                angular.copy({}, this.tag);
            }
        };
    });