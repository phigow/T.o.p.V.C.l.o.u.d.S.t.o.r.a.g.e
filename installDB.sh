#!/bin/bash
sed -i "8iwait_timeout = 31536000" /etc/my.cnf
sed -i "8imax_allowed_packet = 67108864" /etc/my.cnf
service mysqld restart
cd /opt/CherryPy-3.8.0/
python setup.py install
sed -i "s/<%ipv4Address%>/$1/g" `grep ipv4Address -rl /opt/CherryPy-3.8.0/cherrypy/`
sed -i "s/<%dbPassword%>/$2/g" `grep dbPassword -rl /opt/CherryPy-3.8.0/cherrypy/`
chmod +x /opt/restartEngine.sh
/opt/restartEngine.sh
echo /opt/restartEngine.sh >> /etc/rc.local
