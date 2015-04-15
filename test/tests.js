var assert = require("chai").assert;
var app = require("../primes");

function isPrime(n) {
    if (n <= 3) { return n > 1; }
    if (n % 2 == 0 || n % 3 == 0) { return false; }
    for (var  i = 5; i * i <= n; i += 6) {
        if (n % i == 0 || n % (i + 2) == 0) { return false; }
    }
    return true;
}

describe('calcPrimes', function() {
  it('should return buffer with entries from 0 to max', function(done) {
    app.calcPrimes(100, function(err, result) {
      assert.equal(result.length, 101);
      done();
    });

  });

  it('should return a buffer with 1 at the position of prime numbers', function(done) {
    app.calcPrimes(100, function(err, result) {
      var correct = true;
      for(var i = 0; i<result.length; i++) {
        if (result[i] === 1) {
          correct = correct && isPrime(i);
        }
      }
      assert.equal(correct, true);
      done();
    });

  });

  it('should return a buffer with 0 at the position of composite numbers', function(done) {
    app.calcPrimes(100, function(err, result) {
      var correct = true;
      for(var i = 0; i<result.length; i++) {
        if (result[i] === 0) {
          correct = correct && !isPrime(i);
        }
      }
      assert.equal(correct, true);
      done();
    });

  });
});


describe('calcResults', function() {

  var buf = new Buffer(10);
  buf[0] = buf[1] = buf[4] = buf[6] = buf[8] = buf[9] = 0;
  buf[2] = buf[3] = buf[5] = buf[7] = 1;

  it('should return an array of primes', function(done) {
    app.calcResults(0, buf, function(err, count, sum, primes) {
      var correct = true;

      for(var i = 0; i<primes.length; i++) {
        correct = correct && isPrime(primes[i]);
      }

      assert.equal(correct, true);
      done();
    });
  });

  it('should return the number of primes', function(done) {
    app.calcResults(0, buf, function(err, count, sum, primes) {
      var correct = true;

      assert.equal(count, primes.length);
      done();
    });
  });

  it('should return the sum of the primes', function(done) {
    app.calcResults(0, buf, function(err, count, sum, primes) {
      var  sumcalc = 0;

      for(var i = 0; i<primes.length; i++) {
        sumcalc += primes[i];
      }

      assert.equal(sum, sumcalc);
      done();
    });
  });
});

