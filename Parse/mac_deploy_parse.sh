if [ -f cloud/main.js ]
 then
    cp cloud/main.js cloud/main.js.bak
    rm cloud/main.js
fi

cat Source/*.js >> cloud/main.js


parse deploy