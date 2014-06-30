var main = function(numbers) {
  var nums = numbers.split(',');

  var ordered = [];
  var sparse = [];

  for (var index=0; index<nums.length; index++) {
    sparse[parseInt(nums[index], 20)] = nums[index];
  }

  for (var index=0; index<sparse.length; index++) {
    if (sparse[index]) ordered.push(sparse[index].trim());
  }

  return ordered.reverse().join(', ');
};