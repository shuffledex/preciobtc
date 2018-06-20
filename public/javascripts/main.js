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

    	$scope.monedas = [
    		{name: "BTC"},
    		{name: "ARS"}
    	];
    	$scope.operaciones = [
    		{name: "Compra"},
    		{name: "Venta"}
    	];

    	$scope.buyASC = _.filter(arrs[0], function(o) {
    		return o.buy != 0
    	});
    	$scope.sellDESC = _.filter(arrs[1], function(o) {
    		return o.sell != 0
    	});

    	$scope.onlyTransferencia = _.filter($scope.buyASC, function(o) {
    		return o.cargar.transferencia !== undefined;
    	});
    	$scope.bestTransferencia = tableSort(addFee("Transferencia", $scope.onlyTransferencia), "asc");

    	$scope.onlyMercadopago = _.filter($scope.buyASC, function(o) {
    		return o.cargar.mercadopago !== undefined;
    	});
    	$scope.bestMercadopago = tableSort(addFee("Mercadopago", $scope.onlyMercadopago), "asc");

    	$scope.onlyeRapipago = _.filter($scope.buyASC, function(o) {
    		return o.cargar.rapipago_pagofacil !== undefined;
    	});
    	$scope.bestRapipago = tableSort(addFee("Rapipago/Pagofacil", $scope.onlyeRapipago), "asc");

    	$scope.onlyWallet = _.filter($scope.sellDESC, function(o) {
    		return o.vender !== undefined && o.vender > 0;
    	});
    	$scope.bestWallet = tableSort(addFee("Wallet", $scope.onlyWallet), "desc");

    	$scope.onlyDeposito = _.filter($scope.sellDESC, function(o) {
    		return o.retirar !== undefined && o.retirar.transferencia !== undefined;
    	});
    	$scope.bestDeposito = tableSort(addFee("Deposito", $scope.onlyDeposito), "desc");

    	$scope.onlySellMercadopago = _.filter($scope.sellDESC, function(o) {
    		return o.retirar !== undefined && o.retirar.mercadopago !== undefined;
    	});
    	$scope.bestSellMercadopago = tableSort(addFee("sellMercadopago", $scope.onlySellMercadopago), "desc");

    	$scope.radioModoCompra = "transferencia";
    	$scope.tableBuy = addFee("Transferencia", $scope.buyASC);
    	$scope.radioModoVenta = "billetera";
    	$scope.tableSell = addFee("Wallet", $scope.sellDESC);

    });

    mySocket.on('dolar', function (ev, data) {
    	$scope.dolar = ev;
    });

    $scope.mercados = [];
    precioMercados = [];
    precioMercados['bitfinex'] = 0;
    precioMercados['bitstamp'] = 0;

    mySocket.on('bitfinex', function (ev, data) {
    	$scope.bitfinex = ev;
		precioMercados['bitfinex'] = ev.last_price;
		if (!_.find($scope.mercados, function(o) { return o.name == "Bitfinex" })) {
			$scope.mercados.push({name: 'Bitfinex'});
			$scope.selectedMercadoCompra = $scope.selectedMercadoVenta = $scope.mercados[0];
		}
    });

    mySocket.on('bitstamp', function (ev, data) {
		$scope.bitstamp = ev;
		precioMercados['bitstamp'] = ev.last;
		if (!_.find($scope.mercados, function(o) { return o.name == "Bitstamp" })) {
			$scope.mercados.push({name: 'Bitstamp'});
			$scope.selectedMercadoCompra = $scope.selectedMercadoVenta = $scope.mercados[0];
		}
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
			$scope.modos = [{name: "Wallet"}, {name: "Deposito"}, {name: "Mercadopago"}]
		}
	}

	$scope.modosChange = function() {
		if (!$scope.selectedModo) {
			return
		}
		if ($scope.selectedModo.name == "Transferencia") {
			$scope.sitios = $scope.onlyTransferencia;
			$scope.radioModoCompra = "transferencia";
			$scope.tableBuy = $scope.bestTransferencia;
		}
		else if ($scope.selectedModo.name == "Mercadopago" && $scope.selectedOperacion.name == "Compra") {
			$scope.sitios = $scope.onlyMercadopago;
			$scope.radioModoCompra = "mercadopago";
			$scope.tableBuy = $scope.bestMercadopago;
		}
		else if ($scope.selectedModo.name == "Rapipago/Pagofacil") {
			$scope.sitios = $scope.onlyeRapipago;
			$scope.radioModoCompra = "rapipago";
			$scope.tableBuy = $scope.bestRapipago;
		}
		else if ($scope.selectedModo.name == "Wallet") {
			$scope.sitios = _.filter($scope.buyASC, function(o) {
				return o.vender !== undefined && o.vender > 0;
			});
			$scope.radioModoVenta = "billetera";
			$scope.tableSell = $scope.bestWallet;
		}
		else if ($scope.selectedModo.name == "Deposito") {
			$scope.sitios = _.filter($scope.buyASC, function(o) {
				return o.retirar !== undefined && o.retirar.transferencia !== undefined;
			});
			$scope.radioModoVenta = "pesos";
			$scope.tableSell = $scope.bestDeposito;
		}
		else if ($scope.selectedModo.name == "Mercadopago" && $scope.selectedOperacion.name == "Venta") {
			$scope.sitios = _.filter($scope.buyASC, function(o) {
				return o.retirar !== undefined && o.retirar.mercadopago !== undefined;
			});
			$scope.radioModoVenta = "mercadopago";
			$scope.tableSell = $scope.bestSellMercadopago;
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
		else if ($scope.radioModoVenta == "mercadopago") {
			$scope.tableSell = $scope.bestSellMercadopago
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
			return element.vender !== undefined && element.vender > 0;
		}
		else if ($scope.radioModoVenta == "pesos") {
			return element.retirar !== undefined && element.retirar.transferencia !== undefined;
		}
		else if ($scope.radioModoVenta == "mercadopago") {
			return element.retirar !== undefined && element.retirar.mercadopago !== undefined;
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
			retirar: json["ArgenBTC"].retirar,
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
			retirar: json["Bitinka"].retirar,
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
			retirar: json["Buda"].retirar,
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
			retirar: json["BuenBit"].retirar,
			type: json["BuenBit"].type
		})
		/*arr.push({
			name: "CoinASAP",
			buy: json["CoinASAP"].buy,
			sell: json["CoinASAP"].sell,
			timestamp: json["CoinASAP"].timestamp,
			cargar: json["CoinASAP"].cargar,
			comprar: json["CoinASAP"].comprar,
			vender: json["CoinASAP"].vender,
			retirar: json["CoinASAP"].retirar,
			type: json["CoinASAP"].type
		})*/
		arr.push({
			name: "CryptoMKT",
			buy: json["CryptoMKT"].buy,
			sell: json["CryptoMKT"].sell,
			timestamp: json["CryptoMKT"].timestamp,
			cargar: json["CryptoMKT"].cargar,
			comprar: json["CryptoMKT"].comprar,
			vender: json["CryptoMKT"].vender,
			retirar: json["CryptoMKT"].retirar,
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
			retirar: json["Ripio"].retirar,
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
			retirar: json["Saldo"].retirar,
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
			retirar: json["SatoshiTango"].retirar,
			type: json["SatoshiTango"].type
		})
		arr.push({
			name: "VentaBTC",
			buy: json["VentaBTC"].buy,
			sell: json["VentaBTC"].sell,
			timestamp: json["VentaBTC"].timestamp,
			cargar: json["VentaBTC"].cargar,
			comprar: json["VentaBTC"].comprar,
			retirar: json["VentaBTC"].retirar,
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
				_sitio.buy = ((_sitio.buy * (1 + _sitio.cargar.transferencia)) * (1 + _sitio.comprar))
				newSitios.push(_sitio)
			})
		}
		else if (modo == "Mercadopago") {
			var newSitios = [];
			(sitios).forEach(function(sitio){
				var _sitio = _.clone(sitio, true);
				_sitio.buy = _sitio.buy = ((_sitio.buy * (1 + _sitio.cargar.mercadopago)) * (1 + _sitio.comprar))
				newSitios.push(_sitio)
			})
		}
		else if (modo == "Rapipago/Pagofacil") {
			var newSitios = [];
			(sitios).forEach(function(sitio){
				var _sitio = _.clone(sitio, true);
				_sitio.buy = _sitio.buy = ((_sitio.buy * (1 + _sitio.cargar.rapipago_pagofacil)) * (1 + _sitio.comprar))
				newSitios.push(_sitio)
			})
		}
		else if (modo == "Wallet") {
			var newSitios = [];
			(sitios).forEach(function(sitio){
				var _sitio = _.clone(sitio, true);
				if (_sitio.vender !== undefined) {
					_sitio.sell = _sitio.sell * (1 - _sitio.vender)
					newSitios.push(_sitio)
				}
			})
		}
		else if (modo == "Deposito") {
			var newSitios = [];
			(sitios).forEach(function(sitio){
				var _sitio = _.clone(sitio, true);
				if (_sitio.retirar !== undefined && _sitio.retirar.transferencia !== undefined) {
					_sitio.sell = _sitio.sell * (1 - _sitio.retirar.transferencia)
					newSitios.push(_sitio)
				}
			})
		}
		else if (modo == "sellMercadopago") {
			var newSitios = [];
			(sitios).forEach(function(sitio){
				var _sitio = _.clone(sitio, true);
				if (_sitio.retirar !== undefined && _sitio.retirar.mercadopago !== undefined) {
					_sitio.sell = _sitio.sell * (1 - _sitio.retirar.mercadopago)
					newSitios.push(_sitio)
				}
			})
		}
		return newSitios
	}
})
.filter('mercado', function() {
	return function(input, mercado, dolar) {
    if (mercado && dolar) {
    	var _mercado = parseFloat(precioMercados[(mercado.name).toLowerCase()])
		return ((input / (_mercado * dolar)) - 1) * 100
    }
    return "?"
	};
})
.directive('menu', function () {
	return {
		restrict: 'EA',       
		scope: {
			active: '@'
		},
		templateUrl: '../views/menu.html',
		link: function ($scope, element, attrs) {
		    $scope.openMenu = function() {
			    var x = document.getElementById("myTopnav");
			    if (x.className === "topnav") {
			        x.className += " responsive";
			    } else {
			        x.className = "topnav";
			    }
		    }
		}
  }
})
.directive('pie', function () {
	return {
		restrict: 'EA',  
		replace: true,   
		scope: {},
		templateUrl: '../views/pie.html',
		link: function ($scope, element, attrs) {}
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