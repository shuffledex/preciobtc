angular.module('preciobtc.controllers', [])
.constant('_', window._)
.controller('mainController', function($scope, $filter, $document, mySocket, generateJson, addFee, tableSort) {

    mySocket.on('prices', function (ev, data) {
    	var arrs = generateJson(ev);

    	$scope.selectedOperacion = null;
    	$scope.selectedModo = null;
    	$scope.selectedSitio = null;
    	$scope.selectedMonto = null;
    	$scope.transShow = false;

    	$scope.monedas = [{name: "BTC"}, {name: "ARS"}];
    	$scope.operaciones = [{name: "Compra"}, {name: "Venta"}];

    	$scope.buyASC = arrs[0];
    	$scope.sellDESC = arrs[1];

    	$scope.onlyTransferencia = _.filter($scope.buyASC, function(o) { return o.cargar.hasOwnProperty("transferencia") });
    	$scope.bestTransferencia = tableSort(addFee("Transferencia", $scope.onlyTransferencia), "asc");
    	$scope.onlyMercadopago = _.filter($scope.buyASC, function(o) { return o.cargar.hasOwnProperty("mercadopago") });
    	$scope.bestMercadopago = tableSort(addFee("Mercadopago", $scope.onlyMercadopago), "asc");
    	$scope.onlyeRapipago = _.filter($scope.buyASC, function(o) { return o.cargar.hasOwnProperty("rapipago_pagofacil") });
    	$scope.bestRapipago = tableSort(addFee("Rapipago/Pagofacil", $scope.onlyeRapipago), "asc");

    	$scope.bestWallet = tableSort(addFee("Wallet", $scope.sellDESC), "desc");
    	$scope.bestDeposito = tableSort(addFee("Deposito", $scope.sellDESC), "desc");

    	$scope.radioModoCompra = "transferencia";
    	$scope.tableBuy = addFee("Transferencia", $scope.buyASC);
    	$scope.radioModoVenta = "billetera";
    	$scope.tableSell = addFee("Wallet", $scope.sellDESC);

    });

    mySocket.on('dolar', function (ev, data) {
    	$scope.dolar = ev;
    });

    mySocket.on('bitfinex', function (ev, data) {
    	$scope.bitfinex = ev;
    });

    mySocket.on('bitstamp', function (ev, data) {
    	$scope.bitstamp = ev;
    });

	$scope.buttonaAction = function() {
		if ($scope.selectedOperacion === undefined ||
			$scope.selectedModo === undefined ||
			$scope.selectedSitio === undefined ||
			$scope.selectedMonto === undefined) {
			return
		}

		$scope.transMsg = "";

		if ($scope.selectedOperacion.name == "Compra") {

			var newSitios;
			if ($scope.selectedModo.name == "Transferencia") {
				newSitios = $scope.bestTransferencia;
			}
			else if ($scope.selectedModo.name == "Mercadopago") {
				newSitios = $scope.bestMercadopago;
			}
			else if ($scope.selectedModo.name == "Rapipago/Pagofacil") {
				newSitios = $scope.bestRapipago;
			}

			var selectedSitio = _.find(newSitios, function(o) { return o.name == $scope.selectedSitio.name });
			$scope.buyInBTC = parseFloat($scope.selectedMonto) * selectedSitio.buy;
			$scope.buyInARS = parseFloat($scope.selectedMonto) / selectedSitio.buy;

			if (selectedSitio.name == newSitios[0].name) {
				$scope.transMsg = "Estás comprando al mejor precio!";
			} else {
				var newValue = parseFloat($scope.selectedMonto) / newSitios[0].buy;
				$scope.transMsg = "Comprando en " + newSitios[0].name + " obtendrías " + newValue + " BTC";//(+" + (newValue - $scope.buyInARS) + ")";
			}

			if ($scope.selectedModo.name == "Transferencia") {
				$scope.questionMsg = "Fees por Transf.: " + $scope.selectedSitio.comprar + "% + " + $scope.selectedSitio.cargar.transferencia + "%"
			}
			else if ($scope.selectedModo.name == "Mercadopago") {
				$scope.questionMsg = "Fees por Mercadopago: " + $scope.selectedSitio.comprar + "% + " + $scope.selectedSitio.cargar.mercadopago + "%"
			}
			else if ($scope.selectedModo.name == "Rapipago/Pagofacil") {
				$scope.questionMsg = "Fees de Rapipago/Pagofacil: " + $scope.selectedSitio.comprar + "% + " + $scope.selectedSitio.cargar.rapipago_pagofacil + "%"
			}
		}
		else if ($scope.selectedOperacion.name == "Venta") {

			var newSitios;
			if ($scope.selectedModo.name == "Wallet") {
				newSitios = $scope.bestWallet;
			}
			else if ($scope.selectedModo.name == "Deposito") {
				newSitios = $scope.bestDeposito;
			}

			var selectedSitio = _.find(newSitios, function(o) { return o.name == $scope.selectedSitio.name });
			$scope.sellInBTC = parseFloat($scope.selectedMonto) * selectedSitio.sell;

			if (selectedSitio.name == newSitios[0].name) {
				$scope.transMsg = "Estás vendiendo al mejor precio!";
			} else {
				var newValue = parseFloat($scope.selectedMonto) * newSitios[0].sell;
				$scope.transMsg = "Vendiendo en " + newSitios[0].name + " obtendrías " + $filter('currency')(newValue, "$", 2);// + " (+" + $filter('currency')(newValue - buyInBTC, "$", 2) + ")";
			}
		}
		$scope.transShow = true;
	    var card = angular.element(document.getElementById('card'));
	    $document.scrollToElementAnimated(card);
	}
	$scope.inputChange = function() {
		$scope.transShow = false;
	}
	$scope.operacionChange = function() {
		$scope.transShow = false;
		$scope.selectedSitio = null;
		$scope.selectedMonto = null;
		if ($scope.selectedOperacion.name == "Compra") {
			$scope.modos = [{name: "Transferencia"}, {name: "Mercadopago"}, {name: "Rapipago/Pagofacil"}]
		}
		else if ($scope.selectedOperacion.name == "Venta") {
			$scope.modos = [{name: "Wallet"}, {name: "Deposito"}]
		}
	}
	$scope.modosChange = function() {
		if (!$scope.selectedModo) {
			return
		}
		if ($scope.selectedModo.name == "Transferencia") {
			$scope.sitios = $scope.onlyTransferencia;
			$scope.radioModoCompra = "transferencia";
			$scope.tableBuy = $scope.bestTransferencia
		}
		else if ($scope.selectedModo.name == "Mercadopago") {
			$scope.sitios = $scope.onlyMercadopago;
			$scope.radioModoCompra = "mercadopago";
			$scope.tableBuy = $scope.bestMercadopago
		}
		else if ($scope.selectedModo.name == "Rapipago/Pagofacil") {
			$scope.sitios = $scope.onlyeRapipago;
			$scope.radioModoCompra = "rapipago";
			$scope.tableBuy = $scope.bestRapipago
		}
		else if ($scope.selectedModo.name == "Wallet") {
			$scope.sitios = _.filter($scope.buyASC, function(o) {
				if (!o.hasOwnProperty("vender")) {
					return false
				}
				return o.vender.hasOwnProperty("billetera")
			});
			$scope.radioModoVenta = "billetera";
			$scope.tableSell = $scope.bestWallet
		}
		else if ($scope.selectedModo.name == "Deposito") {
			$scope.sitios = _.filter($scope.buyASC, function(o) {
				if (!o.hasOwnProperty("vender")) {
					return false
				}
				return o.vender.hasOwnProperty("pesos")
			});
			$scope.radioModoVenta = "pesos";
			$scope.tableSell = $scope.bestDeposito
		}

		$scope.transShow = false;
		$scope.selectedMonto = null;
	}
	$scope.radioCompraChange = function() {
		if ($scope.radioModoCompra == "transferencia") {
			$scope.tableBuy = $scope.bestTransferencia
		}
		else if ($scope.radioModoCompra == "mercadopago") {
			$scope.tableBuy = $scope.bestMercadopago
		}
		else if ($scope.radioModoCompra == "rapipago") {
			$scope.tableBuy = $scope.bestRapipago
		}
	}
	$scope.radioVenderChange = function() {
		if ($scope.radioModoVenta == "billetera") {
			$scope.tableSell = $scope.bestWallet
		}
		else if ($scope.radioModoVenta == "pesos") {
			$scope.tableSell = $scope.bestDeposito
		}
	}
	$scope.filterCompra = function(element) {
		if ($scope.radioModoCompra == "transferencia") {
			return element.cargar.hasOwnProperty("transferencia") ? true : false
		}
		else if ($scope.radioModoCompra == "mercadopago") {
			return element.cargar.hasOwnProperty("mercadopago") ? true : false
		}
		else if ($scope.radioModoCompra == "rapipago") {
			return element.cargar.hasOwnProperty("rapipago_pagofacil") ? true : false
		}
	}
	$scope.filterVenta = function(element) {
		if ($scope.radioModoVenta == "billetera") {
			return element.vender.hasOwnProperty("billetera") ? true : false
		}
		else if ($scope.radioModoVenta == "pesos") {
			return element.vender.hasOwnProperty("pesos") ? true : false
		}
	}
});

angular.module('preciobtc.services', [])
.factory('mySocket', function(socketFactory) {
	var mySocket = socketFactory();
	return mySocket;
})
.factory('tableSort', function() {
	return function(json, mode) {
		if (mode == "asc") {
			return json.sort(function(a, b) {
				return Math.round(a.buy) - Math.round(b.buy);
			})
		}
		else if (mode == "desc") {
			return json.sort(function(a, b) {
				return Math.round(b.sell) - Math.round(a.sell);
			})
		}
	}
})
.factory('generateJson', function() {
	return function(json) {
		var arr = []
		arr.push({
			name: "ArgenBTC",
			buy: json["ArgenBTC"].buy,
			sell: json["ArgenBTC"].sell,
			timestamp: json["ArgenBTC"].timestamp,
			cargar: json["ArgenBTC"].cargar,
			comprar: json["ArgenBTC"].comprar,
			vender: json["ArgenBTC"].vender,
			type: json["ArgenBTC"].type
		})
		arr.push({
			name: "Bitinka",
			buy: json["Bitinka"].buy,
			sell: json["Bitinka"].sell,
			timestamp: json["Bitinka"].timestamp,
			cargar: json["Bitinka"].cargar,
			comprar: json["Bitinka"].comprar,
			vender: json["Bitinka"].vender,
			type: json["Bitinka"].type
		})
		arr.push({
			name: "Buda",
			buy: json["Buda"].buy,
			sell: json["Buda"].sell,
			timestamp: json["Buda"].timestamp,
			cargar: json["Buda"].cargar,
			comprar: json["Buda"].comprar,
			vender: json["Buda"].vender,
			type: json["Buda"].type
		})
		arr.push({
			name: "BuenBit",
			buy: json["BuenBit"].buy,
			sell: json["BuenBit"].sell,
			timestamp: json["BuenBit"].timestamp,
			cargar: json["BuenBit"].cargar,
			comprar: json["BuenBit"].comprar,
			vender: json["BuenBit"].vender,
			type: json["BuenBit"].type
		})
		arr.push({
			name: "CoinASAP",
			buy: json["CoinASAP"].buy,
			sell: json["CoinASAP"].sell,
			timestamp: json["CoinASAP"].timestamp,
			cargar: json["CoinASAP"].cargar,
			comprar: json["CoinASAP"].comprar,
			vender: json["CoinASAP"].vender,
			type: json["CoinASAP"].type
		})
		arr.push({
			name: "CryptoMKT",
			buy: json["CryptoMKT"].buy,
			sell: json["CryptoMKT"].sell,
			timestamp: json["CryptoMKT"].timestamp,
			cargar: json["CryptoMKT"].cargar,
			comprar: json["CryptoMKT"].comprar,
			vender: json["CryptoMKT"].vender,
			type: json["CryptoMKT"].type
		})
		arr.push({
			name: "Ripio",
			buy: json["Ripio"].buy,
			sell: json["Ripio"].sell,
			timestamp: json["Ripio"].timestamp,
			cargar: json["Ripio"].cargar,
			comprar: json["Ripio"].comprar,
			vender: json["Ripio"].vender,
			type: json["Ripio"].type
		})
		arr.push({
			name: "Saldo",
			buy: json["Saldo"].buy,
			sell: json["Saldo"].sell,
			timestamp: json["Saldo"].timestamp,
			cargar: json["Saldo"].cargar,
			comprar: json["Saldo"].comprar,
			vender: json["Saldo"].vender,
			type: json["Saldo"].type
		})
		arr.push({
			name: "SatoshiTango",
			buy: json["SatoshiTango"].buy,
			sell: json["SatoshiTango"].sell,
			timestamp: json["SatoshiTango"].timestamp,
			cargar: json["SatoshiTango"].cargar,
			comprar: json["SatoshiTango"].comprar,
			vender: json["SatoshiTango"].vender,
			type: json["SatoshiTango"].type
		})
		arr.push({
			name: "VentaBTC",
			buy: json["VentaBTC"].buy,
			sell: json["VentaBTC"].sell,
			timestamp: json["VentaBTC"].timestamp,
			cargar: json["VentaBTC"].cargar,
			comprar: json["VentaBTC"].comprar,
			type: json["VentaBTC"].type
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
.factory('addFee', function() {
	return function(modo, sitios) {
		if (modo == "Transferencia") {
			var newSitios = [];
			(sitios).forEach(function(sitio){
				var _sitio = _.clone(sitio, true);
				_sitio.buy = _sitio.buy + (_sitio.buy * _sitio.cargar.transferencia) + (_sitio.buy * _sitio.comprar)
				newSitios.push(_sitio)
			})
		}
		else if (modo == "Mercadopago") {
			var newSitios = [];
			(sitios).forEach(function(sitio){
				var _sitio = _.clone(sitio, true);
				_sitio.buy = _sitio.buy + (_sitio.buy * _sitio.cargar.mercadopago) + (_sitio.buy * _sitio.comprar)
				newSitios.push(_sitio)
			})
		}
		else if (modo == "Rapipago/Pagofacil") {
			var newSitios = [];
			(sitios).forEach(function(sitio){
				var _sitio = _.clone(sitio, true);
				_sitio.buy = _sitio.buy + (_sitio.buy * _sitio.cargar.rapipago_pagofacil) + (_sitio.buy * _sitio.comprar)
				newSitios.push(_sitio)
			})
		}
		else if (modo == "Wallet") {
			var newSitios = [];
			(sitios).forEach(function(sitio){
				var _sitio = _.clone(sitio, true);
				if (_sitio.hasOwnProperty("vender")) {
					_sitio.sell = _sitio.sell - (_sitio.sell * _sitio.vender.billetera)
					newSitios.push(_sitio)
				}
			})
		}
		else if (modo == "Deposito") {
			var newSitios = [];
			(sitios).forEach(function(sitio){
				var _sitio = _.clone(sitio, true);
				if (_sitio.hasOwnProperty("vender")) {
					_sitio.sell = _sitio.sell - (_sitio.sell * _sitio.vender.pesos)
					newSitios.push(_sitio)
				}
			})
		}
		return newSitios
	}
})

angular.module('preciobtc', [
	'btford.socket-io',
	'ngAnimate',
	'720kb.tooltips',
	'duScroll',
	'preciobtc.controllers',
	'preciobtc.services'
]);