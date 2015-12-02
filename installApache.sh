#!/bin/bash
sed -i "20iHeader set Access-Control-Allow-Origin *" /etc/httpd/conf.d/secpython.conf
sed -i "s#DocumentRoot \"/var/www/html#DocumentRoot \"/var/www/html/ceph#g" /etc/httpd/conf/httpd.conf
sed -i "s/DirectoryIndex index.html/DirectoryIndex login.html/g" /etc/httpd/conf/httpd.conf
sed -i "s/192.168.50.90/$1/g" `grep 192.168.50.90 -rl /var/www/html/ceph`
service httpd restart
