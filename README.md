## Deploy Instruction
## 安装说明

1	安装mysql，配置并创建数据库huacloud
1.1 mysql -uroot -p
1.2 >create database huacloud;
1.3 >use mysql;
1.4 >update user set host = '%' where user = 'root';
1.5 导入数据mysql huacloud -uroot -p < data.sql

2	复制frontend.tar至/var/www/html目录并解压

3	复制backend.tar至/opt目录并解压

4	执行install.sh依次输入ip地址和mysql密码

5	访问ip，用户名admin密码111111