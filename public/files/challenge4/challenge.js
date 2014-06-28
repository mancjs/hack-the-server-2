var jqa = window[atob('YXRvYg==')];
var ls = window[jqa('bG9jYWxTdG9yYWdl')];
var js = window[jqa('SlNPTg==')][jqa('c3RyaW5naWZ5')];
var mm = window[jqa('TWF0aA==')];
var mf = mm[jqa('Zmxvb3I=')];
var mr = mm[jqa('cmFuZG9t')];

if (!ls) {
  return window[['e', 'v', 'a', 'l'].join('')](jqa('ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vLWxvY2FsJykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7'));
}

var rpn = function() {
  var c = 'abcdefghiklmnopqrstuvwxyzABCDEFGHIKLMNOPQRSTUVWXYZ';
  var s = '';

  for (var i=0; i<30; i++) {
    var rn = mf(mr() * c.length);
    s += c.substring(rn, rn + 1);
  }

  return s;
};

var grn = function(x) {
  if (x) {
    return { n1: 3490, n2: 7540, n3: 3970 };
  };

  var n1 = mf(mr() * 10000);
  var n2 = mf(mr() * 10000);
  var n3 = mf(mr() * 10000);

  if ((n1 + n2 + n3) / 75 === 200) {
    // random combination matches answer so skip it
    return grn();
  } else {
    return { n1: n1, n2: n2, n3: n3 };
  }
};

var gi = jqa('Z2V0SXRlbQ==');
var si = jqa('c2V0SXRlbQ==');
var c = jqa('Y2xlYXI=');

var ei = ls[gi](jqa('ZXZlbnRJbmRleA=='));
ls[c]();
ls[si](jqa('ZXZlbnRJbmRleA=='), ei);

for (var i=0; i<1000; i++) {
  var o = {};
  var x = i === (1000 - 176);
  var ns = grn(x);

  // Correct keys are:
  // qUpBmkyXnXldwIGSusHHakQSUulsrC : 3
  // OXWOMyKXfktyqCfwwxQKMNzOiswuGT : 1
  // IABvPtgopPExUrnIuYpbUIxtScYGQQ : 2

  o[x ? jqa('cVVwQm1reVhuWGxkd0lHU3VzSEhha1FTVXVsc3JD') : rpn()] = ns.n1;
  o[x ? jqa('T1hXT015S1hma3R5cUNmd3d4UUtNTnpPaXN3dUdU') : rpn()] = ns.n2;
  o[x ? jqa('SUFCdlB0Z29wUEV4VXJuSXVZcGJVSXh0U2NZR1FR') : rpn()] = ns.n3;

  ls[si](i, js(o));
}

// Solution
// for (var key in localStorage) {
//   var o = JSON.parse(localStorage.getItem(key));
//   var total = 0;

//   for (var k in o) {
//     total += o[k];
//   }

//   if (total === 15000) {
//     console.log(o);
//     break;
//   }
// }