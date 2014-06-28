var sortKeys = function(obj) {
  var items = [];

  for (var prop in obj) {
    items.push({ key: prop, value: obj[prop] });
  }

  return items.sort(function(a, b) {
    if (a.value < b.value) return 1;
    if (a.value > b.value) return -1;
    return 0;
  });
};

for (var key in localStorage) {
  if (key === 'eventIndex') continue;

  var data = localStorage.getItem(key);
  var obj = JSON.parse(data);
  var total = 0;

  for (var prop in obj) {
    total += obj[prop];
  }

  if (total === 15000) {
    var keys = sortKeys(obj).map(function(item) {
      return item.key;
    });

    console.log('The next URL is: ' + keys.join(''));
    break;
  }
}