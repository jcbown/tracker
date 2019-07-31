# Tracker

An offline task management web application, developed for the individual working in an Enterprise organisation.

The goals of this project include:
 * being able to run offline i.e. all data is stored on the local machine only
 * being able to run without administrative privileges
 * being able to simply create and progress tasks through a workflow
 * being able to effectively prioritise which tasks should be worked on
 * being able to report what has been done at various different scopes (levels of detail)

The features of this web application include:
 * a two-dimensional prioritisation grid: task value vs task urgency
 * the ability to snooze tasks
 * tagging tasks with multiple labels
 * recurring tasks
 * time-based reporting of completed tasks

# For Users
## Pre-Requisites
Java 8 or higher must be installed and available on the PATH of the machine.

## How to Install
Simply unzip the zip or tar.gz archive into a new directory.

## How to Configure
You can optionally modify the application.properties file in the directory to change the username, password, port, or context path.

## How to Start the Application
1. Run either the start.cmd (Windows) or start.sh (Mac and Linux) script to start the application.
2. You can access the web application in your web browser at the following link: `http://localhost:12378/tracker/index.html`
3. The default username/password is `admin`/`password`

## How to Stop the Application
Using a process explorer you should kill the `javaw.exe` process which the startup script initiated.

## Backups
Currently there are no automated backups for the database. You should instead take periodic manual backups.
### Creating Backups
1. Stop the application by killing the `javaw.exe` process
2. Copy the `tracker-hsqldb` directory to the location where you wish to store your backup
### Restoring Backups
1. Stop the application by killing the `javaw.exe` process
2. Remove the `tracker-hsqldb` directory from the installation directory
3. Copy the backup of the `tracker-hsqldb` into the installation directory

# For Developers

## Modules
### tracker-dist
An assembly module used to build a zip and tar.gz archive of the application to be downloaded by potential users.
### tracker-web
The main module for the application which contains both the server-side and client-side source code.
This module is built as a Java JAR file which contains an embedded Tomcat instance and database, using Sprint Boot.

## Building
This project can be built using Maven 3 or higher.

## Architecture
The server-side code for this application is relatively dumb. It acts purely as a web service API to persist data to the database. Almost all logic occurs in the client.

As such everything is 'pull' based. This means that snoozes, recurring tasks, notifications etc. are all based on the current status of the
tasks in question rather than relying on server-side jobs. This limits the potential of this application in the name of simplicity.

## Storage
Tracker uses an embedded database which stores its data in files in the working directory.
As such you should be sure to start tracker from the same working directory as the jar file in order to use the same database.

# Versions

### 1.0.0
This is the initial release of Tracker.

### 1.1.0
Bugfix release

### 1.2.0
Added features and changed database schema:
- Introduced reporting Level
- Additional shortcuts

### 1.2.1
Bugfix release
- Added esc key handling in notes
- Fixed help page

### 1.2.2
Build process release
- Change of build process and startup scripts

### 1.3.0
- Added background colour highlighting to indicate 'priority' in matrix
- Added warning when number of tasks exceeds 20

### 1.4.0
- Added suggested tasks based on due date, three things, and started
- Changed default task creation position in grid
- Added 'b' keyboard shortcut for snooze and additional keyboard navigation
- Changed default reporting to today
- Bugfix of cleanup warning to not include snoozed tasks