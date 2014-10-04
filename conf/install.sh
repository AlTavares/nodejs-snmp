#!/bin/sh

sudo echo "deb http://fr.archive.ubuntu.com/ubuntu precise main multiverse" >> /etc/apt/sources.list
sudo apt-get update
sudo apt-get install -y snmp snmpd
sudo apt-get install -y snmp-mibs-downloader
sudo download-mibs
sudo mv /etc/snmp/snmpd.conf /etc/snmp/snmpd.conf.old
sudo cp /vagrant/conf/snmpd.conf /etc/snmp/snmpd.conf
sudo mv /etc/snmp/snmp.conf /etc/snmp/snmp.conf.old
sudo cp /vagrant/conf/snmp.conf /etc/snmp/snmp.conf
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install -y nodejs
sudo apt-get install -y npm
sudo /etc/init.d/snmpd restart
