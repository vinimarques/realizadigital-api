#!/bin/bash
export DEBIAN_FRONTEND=noninteractive
rm -rf /vagrant
mkdir -p /srv/shared/.tmp

echo "+ configure profile"
echo "CURRENT_IP=\$(ifconfig eth1 | grep 'inet addr' | awk '{print \$2}' | sed 's/addr://')" > /root/.bash_profile
echo 'echo -e "\nCurrent IP: ${CURRENT_IP}\n"' >> /root/.bash_profile
echo 'echo -e "Add to /etc/hosts:"' >> /root/.bash_profile
echo 'echo -e "${CURRENT_IP} api.kpi.vm"' >> /root/.bash_profile
echo 'echo -e "Start application by running: pm2 startOrRestart ecosystem.json\n"' >> /root/.bash_profile
echo "cd /srv/shared" >> /root/.bash_profile

echo "+ update apt repository"
apt-get -q -y update 1>/dev/null 2>&1

echo "+ install htop"
apt-get -q -y install htop 1>/dev/null 2>&1

echo "+ install httpd"
apt-get -y install nginx-extras 1>/dev/null 2>&1

echo "+ install ntp"
ntpdate ntp.ubuntu.com 1>/dev/null 2>&1
apt-get -y install ntp 1>/dev/null 2>&1

echo "+ configure vhost"
rm -f /etc/nginx/sites-enabled/*
cp -f /srv/shared/provision/httpd/default /etc/nginx/sites-enabled/shared
service nginx restart 1>/dev/null 2>&1

# echo "+ Installing Imagemagick"
# apt-get -q -y install imagemagick 1>/dev/null 2>&1

echo "+ install mta: postfix"
debconf-set-selections <<< "postfix postfix/mailname string localhost"
debconf-set-selections <<< "postfix postfix/main_mailer_type string 'Internet Site'"
apt-get install -q -y postfix 1>/dev/null 2>&1
postconf -e 'inet_interfaces = localhost' 1>/dev/null 2>&1
postconf -e 'mydestination = ' 1>/dev/null 2>&1
postconf -e 'inet_protocols = ipv4' 1>/dev/null 2>&1
service postfix restart 1>/dev/null 2>&1

echo "+ install git, make, curl"
apt-get -q -y install git make curl 1>/dev/null 2>&1

echo "+ install redis server and flush"
apt-get -q -y install redis-server 1>/dev/null 2>&1
redis-cli FLUSHALL

echo "+ install mysql server and client"
debconf-set-selections <<< 'mysql-server mysql-server/root_password password root'
debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password root'
apt-get -q -y install mysql-server-5.5 mysql-client-5.5 1>/dev/null 2>&1
service mysql restart 1>/dev/null 2>&1
echo -e "[client]\nuser=root\npassword=root" | tee ~/.my.cnf 1>/dev/null 2>&1

echo "+ provisioning database"
bash /srv/shared/provision/database.sh
if [ $? -ne 0 ]; then
  echo "ERROR: failed on database provisioning"
fi

echo "+ install node.js and npm"
git clone https://github.com/visionmedia/n.git /opt/n  1>/dev/null 2>&1
cd /opt/n
make install  1>/dev/null 2>&1
n 6.10.0 1>/dev/null 2>&1

echo "+ install yarn"
npm install -g yarn 1>/dev/null 2>&1

echo "+ install pm2"
npm install -g pm2 1>/dev/null 2>&1

echo "+ project setup"
cd /srv/shared/server
yarn install 1>/dev/null 2>&1
cd /srv/shared
npm install 1>/dev/null 2>&1
su -c "pm2 startOrRestart ecosystem.json" -s /bin/bash vagrant 1>/dev/null 2>&1
mkdir -p /srv/files/
chmod -R 777 /srv/files/

exit 0
