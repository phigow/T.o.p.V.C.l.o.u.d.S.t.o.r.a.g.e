import cherrypy
import requests
import MySQLdb
import thread
import datetime
import time
import json

class HelloWorld(object):
    global cursor,conn
    conn=MySQLdb.connect(host="<%ipv4Address%>",user="root",passwd="<%dbPassword%>",db="huacloud",charset="utf8")
    cursor=conn.cursor()

    def dataRefresh():
	while 1:
	    sql="select ipAdress from serverInfo"
       	    cursor.execute(sql)
            results=cursor.fetchall()
            for row in results:
    	        s=requests.Session()
                r=s.get("http://"+row[0]+":8000/hdinfo")
            	js=json.loads(r.text)
            	name=js["info"]["node_name"]
           	role=js["info"]["ceph_role"]
            	loads=js["info"]["os_load"]
            	runtime=str(js["info"]["day"])+"days"+str(js["info"]["hour"])+":"+str(js["info"]["minute"])+":"+str(js["info"]["second"])
            	status=js["result"]
		result = cursor.execute("update serverInfo set role = (%s), loads = (%s), runtime = (%s), status =(%s) where ipAdress = (%s)", (role, loads, runtime, status, row[0]))
		#update osd info
		isOsd = "osd"
		if isOsd in role :
    		    r=s.get("http://"+row[0]+":8000/storstruct")
		    js=json.loads(r.text)
		    for i in range(0,len(js["info"]),1) :
		    	#print js["info"][i]
		    	osdName=js["info"][i]["name"]
             	    	mnt=js["info"][i]["mt"]
             	    	dev=js["info"][i]["dev"]
      	  	    	size=js["info"][i]["size"]
         	    	used=js["info"][i]["used"]
       	            	weight=js["info"][i]["weight"]
            	   	osdStatus=js["info"][i]["status"]
			slot=js["info"][i]["slot"]
             	    	cursor.execute("update osdInfo set slot=(%s), mnt=(%s), dev=(%s), size=(%s), used=(%s), weight=(%s), status=(%s) where ipAdress = (%s) and name=(%s)", (slot, mnt, dev, size, used, weight, osdStatus, row[0], osdName))
		    	conn.commit()
	    time.sleep(60)

    try:
	thread.start_new_thread(dataRefresh, ())
    except:
	print "sql exceprion"

    @cherrypy.expose
    def listserver(self):
	cherrypy.response.headers["Access-Control-Allow-Origin"] = "*"
	cherrypy.response.headers["Access-Control-Allow-Methods"] = "GET, POST, HEAD, PUT, DELETE"
	response="["
        sql="select ipAdress, node, role, loads, runtime, status from serverInfo"
 	cursor.execute(sql)
	results=cursor.fetchall()
	for row in results:
	    data={'ip':row[0],'name':row[1],'role':row[2],'loads':row[3],'runtime':row[4],'status':row[5]}
	    dataStr=json.dumps(data)
	    response+=dataStr+','
	response=response[:-1]+"]"
        return response

    @cherrypy.expose
    def listosd(self):
        cherrypy.response.headers["Access-Control-Allow-Origin"] = "*"
        cherrypy.response.headers["Access-Control-Allow-Methods"] = "GET, POST, HEAD, PUT, DELETE"
        response="["
        sql="select name, ipAdress, mnt, dev, size, used, weight, status, slot from osdInfo"
        cursor.execute(sql)
        results=cursor.fetchall()
        for row in results:
	    usage=row[5]+"/"+row[4]
	    percentage=float(row[5][:-1])/float(row[4][:-1])
            data={'name':row[0],'ip':row[1],'mnt':row[2],'dev':row[3],'usage':usage,'percentage':percentage,'weight':row[6],'status':row[7],'slot':row[8]}
            dataStr=json.dumps(data)
            response+=dataStr+','
        response=response[:-1]+"]"
        return response

    @cherrypy.expose
    def addserver(self,node,ip):
        cherrypy.response.headers["Access-Control-Allow-Origin"] = "*"
        cherrypy.response.headers["Access-Control-Allow-Methods"] = "GET, POST, HEAD, PUT, DELETE"
        s=requests.Session()
        r=s.get("http://"+ip+":8000/hdinfo")
        js=json.loads(r.text)
        name=js["info"]["node_name"]
        role=js["info"]["ceph_role"]
        loads=js["info"]["os_load"]
        runtime=str(js["info"]["day"])+"days"+str(js["info"]["hour"])+":"+str(js["info"]["minute"])+":"+str(js["info"]["second"])
        status=js["result"]
        #sql = "insert into serverInfo (node, ipAdress, role, loads, runtime, status) values (\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\")"(name, ip, role, loads, runtime, status)
	#print sql
	isOsd="osd"
	if isOsd in role :
	    rr=s.get("http://"+ip+":8000/storstruct")
	    jsjs=json.loads(rr.text)
	    if jsjs["result"] == "failed":
		return "no"
	    for i in range(0,len(jsjs["info"]),1) :
	        osdName=jsjs["info"][i]["name"]
	        mnt=jsjs["info"][i]["mt"]
	      	dev=jsjs["info"][i]["dev"]
	        size=jsjs["info"][i]["size"]
	        used=jsjs["info"][i]["used"]
		usage=used+"/"+size
		percentage=float(used[:-1])*100/float(size[:-1])
	       	weight=jsjs["info"][i]["weight"]
	        osdStatus=jsjs["info"][i]["status"]
		slot=jsjs["info"][i]["slot"]
		cursor.execute("insert into osdInfo (name, ipAdress, mnt, dev, size, used, weight, status, slot) values (%s,%s,%s,%s,%s,%s,%s,%s,%s)", (osdName, ip, mnt, dev, size, used, weight, osdStatus, slot))
	result=cursor.execute("insert into serverInfo (node, ipAdress, role, loads, runtime, status) values (%s,%s,%s,%s,%s,%s)", (name, ip, role, loads, runtime, status))
	return "yes" if type(result)==type(1L) else "no"

    @cherrypy.expose
    def delserver(self,ip):
        cherrypy.response.headers["Access-Control-Allow-Origin"] = "*"
        cherrypy.response.headers["Access-Control-Allow-Methods"] = "GET, POST, HEAD, PUT, DELETE"
        response="["
        sql="delete from serverInfo where ipAdress=(\"%s\")"%(ip)
	sql2="delete from osdInfo where ipAdress=(\"%s\")"%(ip)
        result=cursor.execute(sql)
        result2=cursor.execute(sql2)
        return "yes" if type(result)==type(1L) else "no"

    @cherrypy.expose
    def startosd(self,osd,ip):
	sql="update osdInfo set status = 'up' where ipAdress = ("+ip+") and name=("+osd+")"
	cursor.execute(sql)
	conn.commit()

    @cherrypy.expose
    def stoposd(self,osd,ip):
        sql="update osdInfo set status = 'down' where ipAdress = ("+ip+") and name=("+osd+")"
        cursor.execute(sql)
        conn.commit()

    @cherrypy.expose
    def addosd(self,osd,ip):
        sql="update osdInfo set status = 'up' where ipAdress = ("+ip+") and name=("+osd+")"
        cursor.execute(sql)
        conn.commit()

    @cherrypy.expose
    def delosd(self,osd,ip):        
	sql="update osdInfo set status = 'False' where ipAdress = ("+ip+") and name=("+osd+")"
        cursor.execute(sql)
        conn.commit()

    @cherrypy.expose
    def login(self):
	time = datetime.datetime.now().strftime("%y-%m-%d %H:%M:%S")
	sql="insert into loginInfo (login) values (\'"+str(time)+"\')"
	cursor.execute(sql)
	conn.commit()

    @cherrypy.expose
    def listlogin(self):
	cherrypy.response.headers["Access-Control-Allow-Origin"] = "*"
        cherrypy.response.headers["Access-Control-Allow-Methods"] = "GET, POST, HEAD, PUT, DELETE"
        response="["
        sql="select login from loginInfo order by id desc"
        cursor.execute(sql)
        results=cursor.fetchall()
        for row in results:
            data={'name':'admin','time':row[0].strftime("%Y-%m-%d %H:%M:%S")}
            dataStr=json.dumps(data)
            response+=dataStr+','
        response=response[:-1]+"]"
        return response

    @cherrypy.expose
    def operate(self,op):
        time = datetime.datetime.now().strftime("%y-%m-%d %H:%M:%S")
        sql="insert into operationInfo (operation,time) values (\'"+str(op)+"\',\'"+str(time)+"\')"
        cursor.execute(sql)
        conn.commit()

    @cherrypy.expose
    def listoperate(self):
        cherrypy.response.headers["Access-Control-Allow-Origin"] = "*"
        cherrypy.response.headers["Access-Control-Allow-Methods"] = "GET, POST, HEAD, PUT, DELETE"
        response="["
        sql="select time, operation from operationInfo order by id desc"
        cursor.execute(sql)
        results=cursor.fetchall()
        for row in results:
            data={'name':'admin','time':row[0].strftime("%Y-%m-%d %H:%M:%S"),'operation':str(row[1])}
            dataStr=json.dumps(data)
            response+=dataStr+','
        response=response[:-1]+"]"
        return response

if __name__ == '__main__':
   cherrypy.config.update({'server.socket_host':'0.0.0.0'})
   cherrypy.quickstart(HelloWorld())
