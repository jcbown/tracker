@echo off

start /b cmd /c javaw -cp . -jar tracker-web.jar
echo To end the application you should stop the appropriate 'javaw' process
echo You can now safely close this window and the application will continue
pause