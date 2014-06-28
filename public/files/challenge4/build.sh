#!/bin/bash

cp ./public/files/challenge4/padding.js ./public/files/challenge4/output.js

sed -e '/####CHALLENGE/ {
r ./public/files/challenge4/challenge.js
d
}' < ./public/files/challenge4/output.js > ./public/files/challenge4/script.js

rm ./public/files/challenge4/output.js

uglifyjs2 ./public/files/challenge4/script.js > ./public/files/challenge4/script.min.js

rm ./public/files/challenge4/script.js