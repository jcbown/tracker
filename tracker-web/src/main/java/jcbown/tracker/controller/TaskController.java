package jcbown.tracker.controller;

import jcbown.tracker.bo.Task;
import jcbown.tracker.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

/**
 * Created by jcbown on 05/02/2017.
 */
@RestController
@RequestMapping("tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    /**
     *
     * @param completedAfter milliseconds unix time
     * @return
     */
    @RequestMapping(method = RequestMethod.GET)
    public List<Task> getTasks(@RequestParam(value = "completedAfter", required = false) Long completedAfter) {
        if (completedAfter == null) {
            return taskService.getTasks();
        } else {
            return taskService.getTasks(new Date(completedAfter));
        }
    }

    @RequestMapping(method = RequestMethod.POST)
    public Task postTask(@RequestBody Task task) {
        return taskService.saveTask(task);
    }

    @RequestMapping(method = RequestMethod.PUT, path = "{id}")
    public Task putTask(@PathVariable Long id, @RequestBody Task task) {
        return taskService.saveTask(task);
    }

    @RequestMapping(method = RequestMethod.DELETE, path = "{id}")
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
    }
}
