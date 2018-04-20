package jcbown.tracker.dao;

import jcbown.tracker.bo.Task;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.Date;
import java.util.List;

/**
 * Created by jcbown on 06/02/2017.
 */
public interface TaskRepository extends CrudRepository<Task, Long> {

    List<Task> findAll();

    @Query("SELECT t FROM Task t WHERE t.completedDateTime > ?1 OR t.completedDateTime IS NULL")
    List<Task> findByCompletedDateTime(Date completedAfter);

}
