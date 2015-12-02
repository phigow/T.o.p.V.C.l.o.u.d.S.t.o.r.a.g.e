id=$(ps aux | grep "[m]yapp" | cut -c 10-14)
#echo $id
while [ "$id"x != "x" ]
do
kill $id
id=$(ps aux | grep "[m]yapp" | cut -c 10-14)
done
echo -e "Stopping Backend Engine...                                 [  \e[1;32mOK  \e[0m]"
nohup python /opt/CherryPy-3.8.0/cherrypy/myapp.py >> /var/log/huacloud.log &
echo -e "Starting Backend Engine...                                 [  \e[1;32mOK  \e[0m]"
exit 0 
