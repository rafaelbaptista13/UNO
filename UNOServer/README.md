# How to run

docker run --name mysql8 -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=demo -e MYSQL_USER=demo -e MYSQL_PASSWORD=password -p 3306:3306 -d mysql/mysql-server:8.0.23

node server.js
