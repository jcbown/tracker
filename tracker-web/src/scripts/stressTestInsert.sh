#!/bin/bash
echo "Inserting tasks for stress test"
echo "Inserting 100 Active Tasks"
for run in {1..100}
do
  curl --fail --silent --show-error -X POST -H "Content-Type: application/json" -d '{
      "status": "READY",
      "summary": "this is a task description",
      "urgency": 1,
      "value": 1,
      "threeThings": false,
      "tags": "away,far,gone",
      "recurrenceSchedule": "",
      "dueDate": "2017-02-15T08:00:00.000Z",
      "snoozedUntil": null,
      "completedDateTime": null,
      "notes": "then this will do"
  }' "http://localhost:12378/tracker/tasks" > /dev/null;
done

echo "Inserting 500 Recently Done Tasks"
for run in {1..500}
do
  curl --fail --silent --show-error -X POST -H "Content-Type: application/json" -d '{
      "status": "DONE",
      "summary": "this is a task description",
      "urgency": 1,
      "value": 1,
      "threeThings": false,
      "tags": "away,far,gone",
      "recurrenceSchedule": "",
      "dueDate": "2017-02-15T08:00:00.000Z",
      "snoozedUntil": null,
      "completedDateTime": "2017-02-12T08:00:00.000Z",
      "notes": "then this will do"
  }' "http://localhost:12378/tracker/tasks" > /dev/null;
done

echo "Inserting 10000 Older Done Tasks"
for run in {1..10000}
do
  curl --fail --silent --show-error -X POST -H "Content-Type: application/json" -d '{
      "status": "DONE",
      "summary": "this is a task description",
      "urgency": 1,
      "value": 1,
      "threeThings": false,
      "tags": "away,far,gone",
      "recurrenceSchedule": "",
      "dueDate": "2017-02-15T08:00:00.000Z",
      "snoozedUntil": null,
      "completedDateTime": "2007-02-12T08:00:00.000Z",
      "notes": "then this will do"
  }' "http://localhost:12378/tracker/tasks" > /dev/null;
done

echo "Done!"