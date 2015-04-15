var async = require('async'),
	readline = require('readline'),
	util = require('util'),
	redis = require('redis');

var client = redis.createClient('6379', '127.0.0.1', {'return_buffers': true});

var max = process.argv[2],
	max_lim = 100000000,
	lower,
	upper;

exports.calcPrimes = calcPrimes;
exports.calcResults = calcResults;


function calcPrimes(max, callback)
{
	var nums = new Buffer(Number(max)+1);
	nums.fill(1);
	nums[0] = 0;
	nums[1] = 0;
	
	for(var i = 2; i<=max; i++) {
		if(nums[i] === 1) {
			for(var j = i+i; j <= max; j += i) {
				nums[j] = 0;
			}
		}		
	}

	callback(null, nums);
}


function storeBuffer(name, buff, callback) {
	client.set(name, buff, callback);
}


function getBufferRange(name, lower, upper, callback) {
	client.getrange(name, lower, upper, function(err, result) {
		callback(err, lower, result);
	});
}


function getNum(question, min, max, errmsg, callback) {
	var rl = readline.createInterface({input: process.stdin});

	process.stdout.write(question);
	
	rl.once('line', function(resp) {
		rl.close();
	
		if(/^[0-9]+$/.test(resp) && Number(resp) >= min && Number(resp) <= max) {
			callback(null, Number(resp));
		}
		else {
			getNum(errmsg, min, max, errmsg, callback);
		}
	});
}


function getMax(callback) {
	var prompt = 'Invalid max val entered.  Try again: ';
	var fmt = /^[0-9]+$/;

	if(!fmt.test(max)  || !(Number(max) >= 2) || !(Number(max) <= max_lim)) {
		getNum(prompt, 2, max_lim, prompt, function(err, resp) {
			max = resp;
			callback(null, max);
			}
		);
	}
	else {
		max = Number(max);
		callback(null, max);
	}
}


function getLowerLim(callback) {
	getNum('Enter a lower bound: ',
			0,
			max-1,
			'Invalid lower bound entered.  Try again: ',
			function(err, resp) {
				lower = resp;
				callback(null);
			}
	);
}


function getUpperLim(callback) {
	getNum('Enter an upper bound: ',
			lower+1,
			max,
			'Invalid upper bound entered.  Try again: ',
			function(err, resp) {
				upper = resp;
				callback(null);
			}
	);
}


function calcResults(lower, buffer, callback) {
	var sum = 0,
		count = 0,
		primes = [];

	for(var i = 0; i<buffer.length; i++) {
		if(buffer[i] === 1){
			sum += lower+i;
			count++;
			primes.push(lower+i);
		}
	}

	callback(null, count, sum, primes);
}


function printResults(count, sum, primes, callback)
{
	process.stdout.write('Result:\n');
	if(count) {
		process.stdout.write('Prime numbers: [');
		for(var i=0; i<primes.length - 1; i++) {
			process.stdout.write(primes[i] + ', ');
		}
		process.stdout.write(primes[i] + ']\n');
		process.stdout.write('Sum: ' + sum + '\n');
		process.stdout.write('Mean: ' + sum/count + '\n');
	}
	else {
		process.stdout.write('No primes found in that range\n');
	}
	callback(null);
}


function goodBye(err){
	console.log(err);
	client.end();
	console.log('goodbye!');
}


async.waterfall([
	getMax,
	calcPrimes,
	async.apply(storeBuffer, 'primes')
], function(err, result) {
	if(err) {
		goodBye(err)
	}
	else {
		async.forever(function(next) {
			async.waterfall([
				getLowerLim,
				getUpperLim,
				function(callback) {
					callback(null, lower, upper);
				},
				async.apply(getBufferRange, 'primes'),
				calcResults,
				printResults
			], next);
		}, goodBye);
	}
});

