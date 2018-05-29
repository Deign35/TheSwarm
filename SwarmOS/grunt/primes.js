module.exports = {
    GeneratePrimes: function () {
        var primeLists = {
            100: "",
            300: "",
            500: "",
            1000: "",
            1500: "",
            2000: "",
            2500: "",
            3000: "",
            5000: ""
        };

        var primes = [3, 5, 7, 11];
        var curNum = 13;
        while (primes.length < 3000) {
            for (var primeIndex = 0, length = primes.length; primeIndex < length; primeIndex++) {
                if (curNum % primes[primeIndex] == 0) {
                    curNum += 2;
                    continue;
                }
            }
            primes.push(curNum);
            curNum += 2;
        }
        primes = [2].concat(primes);
        for (var primeListIndex = 0; primeListIndex < primes.length; primeListIndex++) {
            for (var maxNumber in primeLists) {
                if (maxNumber >= primes[primeListIndex]) {
                    primeLists[maxNumber] += primes[primeListIndex] + ', ';
                }
            }
        }

        for (var maxDigit in primeLists) {
            primeLists[maxDigit] = '[' + primeLists[maxDigit].slice(0, -2) + ']';
        }
        return primeLists;
    }
};