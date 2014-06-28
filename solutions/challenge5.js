var mod = function(num, by) {
  while (num >= by) {
    num -= by;
  }

  return num;
};

var fizzBuzz = function(number) {
  var fizz = mod(number, 3) === 0, buzz = mod(number, 5) == 0;
  return fizz ? buzz ? 'FizzBuzz' : 'Fizz' : buzz ? 'Buzz' : number;
};

var main = function(numbers) {
  var results = [];

  for (var i=0; i<numbers.length; i++) {
    results.push(fizzBuzz(numbers[i]));
  }

  return results.join(', ');
};