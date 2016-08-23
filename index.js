const Benchmark = require("benchmark");
const { fromJS, Map } = require("immutable");

function makeData() {
	var data = new Map({});
	for (var i = 0; i < 10000; i += 1) {
		data = data.set(i, i);
	}
	return data;
}

function makeKeys(n) {
	var xs = [];
	for (var i = 0; i < n; i += 1) {
		xs.push("" + n);
	}
	return xs;
}

const data = makeData();

const suite = new Benchmark.Suite();

const nKeys = [100, 1000, 5000, 10000];

nKeys.forEach(function(n) {
	suite.add("Map#delete n=" + n, function() {
		var result = data;
		for (var i = 0; i < n; i += 1) {
			result = result.delete(i);
		}
	});

	suite.add("Map#toJS/fromJS n=" + n, function() {
		var result = data.toJS();
		for (var i = 0; i < n; i += 1) {
			result[i] = undefined;
		}
		result = fromJS(result);
	});

	var keys = makeKeys(n);
	suite.add("Map#filter n=" + n, function() {
		var result = data.filter(function(value, key) {
			return keys.indexOf(key) < 0;
		});
	});

	suite.add("Map#filter w/ lookup n=" + n, function() {
		var result = data.filter(function(v, k) {
			return k <= 10000;
		})
	});

	suite.add("Map#withMutations/delete n=" + n, function() {
		data.withMutations(function(map) {
			for (var i = 0; i < n; i += 1) {
				map = map.delete(i);
			}
		})
	});
});

suite.on('cycle', function(event) {
  console.log(String(event.target));
});

suite.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
});

suite.run({ 'async': true });
