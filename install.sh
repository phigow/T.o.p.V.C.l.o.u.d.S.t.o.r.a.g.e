#!/bin/bash
read -p "Input IP: " ip
read -s -p "Input Database Password: " pswd
path=`pwd`
cd $path
echo ""
$path/installApache.sh ip
$path/installDB.sh ip pawd
