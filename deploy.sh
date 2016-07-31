#!/bin/bash
for file in ./**/*.user.js
do 
    open -a "Firefox" $file
done
