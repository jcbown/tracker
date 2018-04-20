package jcbown.tracker.service;

import jcbown.tracker.bo.Task;

import java.util.Date;
import java.util.List;

/**
 * Created by jcbown on 06/02/2017.
 */
public interface TaskService {

    /**
     *
     * @return all tasks
     */
    List<Task> getTasks();

    /**
     * Gets tasks that either have no completed date or were completed after a certain date.
     *
     * @param completedAfter
     * @return
     */
    List<Task> getTasks(Date completedAfter);

    Task saveTask(Task task);

    void deleteTask(Long id);
}
