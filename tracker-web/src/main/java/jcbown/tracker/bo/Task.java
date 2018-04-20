package jcbown.tracker.bo;

import javax.persistence.*;
import java.util.Date;

/**
 * Created by jcbown on 06/02/2017.
 */
@Entity
@Table(indexes = {
    @Index(name = "TASK_IDX_ID", columnList = "id"),
    @Index(name = "TASK_IDX_COMPLETED", columnList = "completedDateTime")
})
public class Task {

    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TaskStatus status;

    @Column(nullable = false)
    private String summary;

    @Column(nullable = false)
    private int urgency;

    @Column(nullable = false)
    private int value;

    @Column(nullable = false)
    private boolean threeThings;

    @Column
    private String tags;

    @Column
    private String reportingLevelJson;

    @Column
    private String recurrenceSchedule;

    @Column
    @Temporal(TemporalType.TIMESTAMP)
    private Date dueDate;

    @Column
    @Temporal(TemporalType.TIMESTAMP)
    private Date snoozedUntil;

    @Column
    @Temporal(TemporalType.TIMESTAMP)
    private Date completedDateTime;

    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDateTime;

    @Column
    @Temporal(TemporalType.TIMESTAMP)
    private Date modifiedDateTime;

    @Column(columnDefinition = "LONGVARCHAR")
    @Lob
    private String notes;

    protected Task() {

    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public int getUrgency() {
        return urgency;
    }

    public void setUrgency(int urgency) {
        this.urgency = urgency;
    }

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }

    public boolean isThreeThings() {
        return threeThings;
    }

    public void setThreeThings(boolean threeThings) {
        this.threeThings = threeThings;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public String getReportingLevelJson() {
        return reportingLevelJson;
    }

    public void setReportingLevelJson(String reportingLevelJson) {
        this.reportingLevelJson = reportingLevelJson;
    }

    public String getRecurrenceSchedule() {
        return recurrenceSchedule;
    }

    public void setRecurrenceSchedule(String recurrenceSchedule) {
        this.recurrenceSchedule = recurrenceSchedule;
    }

    public Date getDueDate() {
        return dueDate;
    }

    public void setDueDate(Date dueDate) {
        this.dueDate = dueDate;
    }

    public Date getSnoozedUntil() {
        return snoozedUntil;
    }

    public void setSnoozedUntil(Date snoozedUntil) {
        this.snoozedUntil = snoozedUntil;
    }

    public Date getCompletedDateTime() {
        return completedDateTime;
    }

    public void setCompletedDateTime(Date completedDateTime) {
        this.completedDateTime = completedDateTime;
    }

    public Date getCreatedDateTime() {
        return createdDateTime;
    }

    public void setCreatedDateTime(Date createdDateTime) {
        this.createdDateTime = createdDateTime;
    }

    public Date getModifiedDateTime() {
        return modifiedDateTime;
    }

    public void setModifiedDateTime(Date modifiedDateTime) {
        this.modifiedDateTime = modifiedDateTime;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    @PrePersist
    void onPrePersist() {
        this.createdDateTime = new Date();
    }

    @PreUpdate
    void onPreUpdate() {
        this.modifiedDateTime = new Date();
    }

}
