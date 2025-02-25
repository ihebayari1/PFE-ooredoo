package com.ooredoo.report_bulider.entity;


import jakarta.persistence.*;

@Entity
public class SubmissionValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String value;

    @ManyToOne
    @JoinColumn(name = "submission_id")
    private FormSubmission submission;

    @ManyToOne
    @JoinColumn(name = "component_id")
    private FormComponent component;

    public SubmissionValue(Long id, String value, FormSubmission submission, FormComponent component) {
        this.id = id;
        this.value = value;
        this.submission = submission;
        this.component = component;
    }

    public SubmissionValue() {
    }

    public Long getId() {
        return this.id;
    }

    public String getValue() {
        return this.value;
    }

    public FormSubmission getSubmission() {
        return this.submission;
    }

    public FormComponent getComponent() {
        return this.component;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public void setSubmission(FormSubmission submission) {
        this.submission = submission;
    }

    public void setComponent(FormComponent component) {
        this.component = component;
    }
}
