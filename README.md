# Tracker

Tracker is a task management and reporting web application for the individual.

The goals of this project include:
 * being able to simply create and progress tasks through a workflow
 * being able to effectively prioritise which tasks should be worked on
 * being able to report what has been done at various different scopes (levels of detail)

The features of this web application include:
 * a two-dimensional prioritisation grid: task value vs task urgency
 * the ability to snooze tasks
 * tagging tasks with multiple labels
 * recurring tasks
 * time-based reporting of completed tasks

# Usage
## Pre-Requisites
Java 8 or higher must be installed and available on the PATH of the machine.

## How to Install
Simply unzip the zip or tar.gz archive into a new directory.

## How to Configure
You can optionally modify the application.properties file in the directory to change the username, password, port, or context path.

## How to Start the Application
1. Run either the start.cmd (Windows) or start.sh (Linux) script to start the application.
2. You can access the web application in your web browser at the following link: `http://localhost:12378/tracker/index.html`

## How to Stop the Application
Using a process explorer you should kill the `javaw.exe` process which the startup script initiated.

# Architecture
The server-side code for this application is relatively dumb. It acts purely as a web service API. Almost all logic occurs in the client.

As such everything is 'pull' based. This means that snoozes, recurring tasks, notifications etc. are all based on the current status of the
tasks in question rather than relying on some server-side jobs. This limits the potential of this application in the name of simplicity.

## Packaging
Tracker is built as a Java JAR file which contains an embedded Tomcat instance and database. You just need to run the jar file in order to start the application.
This jar file is bundled along with some helpful scripts to zip and tar.gz archives.

## Storage
Tracker uses an embedded database which stores its data in files in the working directory.
As such you should be sure to start tracker from the same working directory as the jar file each time you wish to use the same database. 

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