#!/bin/bash
nohup java -cp . -jar tracker-web.jar < /dev/null > /dev/null 2>&1 &
echo "To end the application you should stop the appropriate 'java' process"
echo "You can now safely close this window and the application will continue"
read -p "Press [Enter] to end"
