var main = function(input) {
  var groups = input.split(' ');
  var string = '';

  for (var i=0; i<groups.length; i++) {
    string += String.fromCharCode(parseInt(groups[i], 2));
  }

  return string;
};