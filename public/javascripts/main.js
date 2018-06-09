angular.module('preciobtc.controllers', [])
.controller('mainController', function($scope, $filter, mySocket, generateJson) {
    mySocket.on('prices', function (ev, data) {
    	var arrs = generateJson(ev);
    	var buyASC = arrs[0]
    	var sellDESC = arrs[1]
    	console.log(buyASC, sellDESC)
    	$scope.sitios = buyASC
    	$scope.monedas = [{name: "BTC"}, {name: "ARS"}]
    	$scope.acciones = [{name: "Compra"}, {name: "Venta"}]
    	$scope.buyASC = buyASC
    	$scope.sellDESC = sellDESC
		$scope.buttonaAction = function() {
			if ($scope.selectedMonto === undefined || $scope.selectedAccion === undefined || $scope.selectedSitio === undefined) {
				return
			}
			var buyInBTC = parseFloat($scope.selectedMonto) * $scope.selectedSitio.buy;
			var buyInARS = parseFloat($scope.selectedMonto) / $scope.selectedSitio.buy;
			var sellInBTC = parseFloat($scope.selectedMonto) * $scope.selectedSitio.sell;
			console.log(buyInBTC, buyInARS, sellInBTC)
			$scope.buyInBTC = buyInBTC;
			$scope.buyInARS = buyInARS;
			$scope.sellInBTC = sellInBTC;
			if ($scope.selectedAccion.name == "Compra" && $scope.selectedSitio.name == buyASC[0].name) {
				$scope.transMsg = "Estás comprando al mejor precio!";
			}
			else if ($scope.selectedAccion.name == "Venta" && $scope.selectedSitio.name == sellDESC[0].name) {
				$scope.transMsg = "Estás vendiendo al mejor precio!";
			}
			else if ($scope.selectedAccion.name == "Compra" && $scope.selectedSitio.name != buyASC[0].name) {
				var newValue = parseFloat($scope.selectedMonto) / $scope.buyASC[0].buy;
				debugger
				$scope.transMsg = "Comprando en " + buyASC[0].name + " obtendrías " + newValue + " BTC (+" + (newValue - buyInARS) + ")";
			}
			else if ($scope.selectedAccion.name == "Venta" && $scope.selectedSitio.name != sellDESC[0].name) {
				var newValue = parseFloat($scope.selectedMonto) * $scope.sellDESC[0].buy;
				$scope.transMsg = "Vendiendo en " + sellDESC[0].name + " obtendrías " + $filter('currency')(newValue, "$", 2) + " (+" + $filter('currency')(newValue - buyInBTC, "$", 2) + ")";
			} else {
				$scope.transMsg = "";
			}
			$scope.transShow = true;
		}
		$scope.inputChange = function() {
			$scope.transShow = false;
		}
		$scope.operacionChange = function() {
			$scope.transShow = false;
			$scope.selectedMonto = null;
		}
    });
});

angular.module('preciobtc.services', [])
.factory('mySocket', function(socketFactory) {
	var mySocket = socketFactory();
	return mySocket;
})
.factory('generateJson', function() {
	return function(json) {
		var arr = []
		arr.push({
			name: "ArgenBTC",
			buy: json["ArgenBTC"].buy,
			sell: json["ArgenBTC"].sell,
			timestamp: json["ArgenBTC"].timestamp
		})
		arr.push({
			name: "Bitinka",
			buy: json["Bitinka"].buy,
			sell: json["Bitinka"].sell,
			timestamp: json["Bitinka"].timestamp
		})
		arr.push({
			name: "Buda",
			buy: json["Buda"].buy,
			sell: json["Buda"].sell,
			timestamp: json["Buda"].timestamp
		})
		arr.push({
			name: "BuenBit",
			buy: json["BuenBit"].buy,
			sell: json["BuenBit"].sell,
			timestamp: json["BuenBit"].timestamp
		})
		arr.push({
			name: "CoinASAP",
			buy: json["CoinASAP"].buy,
			sell: json["CoinASAP"].sell,
			timestamp: json["CoinASAP"].timestamp
		})
		arr.push({
			name: "CryptoMKT",
			buy: json["CryptoMKT"].buy,
			sell: json["CryptoMKT"].sell,
			timestamp: json["CryptoMKT"].timestamp
		})
		arr.push({
			name: "Ripio",
			buy: json["Ripio"].buy,
			sell: json["Ripio"].sell,
			timestamp: json["Ripio"].timestamp
		})
		arr.push({
			name: "Saldo",
			buy: json["Saldo"].buy,
			sell: json["Saldo"].sell,
			timestamp: json["Saldo"].timestamp
		})
		arr.push({
			name: "SatoshiTango",
			buy: json["SatoshiTango"].buy,
			sell: json["SatoshiTango"].sell,
			timestamp: json["SatoshiTango"].timestamp
		})
		arr.push({
			name: "VentaBTC",
			buy: json["VentaBTC"].buy,
			sell: json["VentaBTC"].sell,
			timestamp: json["VentaBTC"].timestamp
		})
		var buyASC = arr.slice(0);
		buyASC = buyASC.sort(function(a, b){
			return Math.round(a.buy) - Math.round(b.buy);
		})
		var sellDESC = arr.slice(0);
		sellDESC = sellDESC.sort(function(a, b){
			return Math.round(b.sell) - Math.round(a.sell);
		})
		return [buyASC, sellDESC]
	}
})

angular.module('preciobtc', [
	'btford.socket-io',
	'ngAnimate',
	'preciobtc.controllers',
	'preciobtc.services'
]);