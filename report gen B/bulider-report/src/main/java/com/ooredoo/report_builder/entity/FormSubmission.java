package com.ooredoo.report_builder.entity;


import com.ooredoo.report_builder.common.BaseEntity;
import com.ooredoo.report_builder.user.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "form_submissions")
public class FormSubmission extends BaseEntity {

    private LocalDateTime submittedAt;

    @ManyToOne
    @JoinColumn(name = "form_id")
    private Form form;

    @ManyToOne
    @JoinColumn(name = "submitted_by_id")
    private User submittedBy;

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL)
    private List<SubmissionValue> values;

    public FormSubmission(LocalDateTime submittedAt, Form form, User submittedBy, List<SubmissionValue> values) {
        this.submittedAt = submittedAt;
        this.form = form;
        this.submittedBy = submittedBy;
        this.values = values;
    }

    public FormSubmission() {
    }

    protected FormSubmission(FormSubmissionBuilder<?, ?> b) {
        super(b);
        this.submittedAt = b.submittedAt;
        this.form = b.form;
        this.submittedBy = b.submittedBy;
        this.values = b.values;
    }

    public static FormSubmissionBuilder<?, ?> builder() {
        return new FormSubmissionBuilderImpl();
    }

    public LocalDateTime getSubmittedAt() {
        return this.submittedAt;
    }

    public Form getForm() {
        return this.form;
    }

    public User getSubmittedBy() {
        return this.submittedBy;
    }

    public List<SubmissionValue> getValues() {
        return this.values;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public void setForm(Form form) {
        this.form = form;
    }

    public void setSubmittedBy(User submittedBy) {
        this.submittedBy = submittedBy;
    }

    public void setValues(List<SubmissionValue> values) {
        this.values = values;
    }

    public static abstract class FormSubmissionBuilder<C extends FormSubmission, B extends FormSubmissionBuilder<C, B>> extends BaseEntityBuilder<C, B> {
        private LocalDateTime submittedAt;
        private Form form;
        private User submittedBy;
        private List<SubmissionValue> values;

        public B submittedAt(LocalDateTime submittedAt) {
            this.submittedAt = submittedAt;
            return self();
        }

        public B form(Form form) {
            this.form = form;
            return self();
        }

        public B submittedBy(User submittedBy) {
            this.submittedBy = submittedBy;
            return self();
        }

        public B values(List<SubmissionValue> values) {
            this.values = values;
            return self();
        }

        protected abstract B self();

        public abstract C build();

        public String toString() {
            return "FormSubmission.FormSubmissionBuilder(super=" + super.toString() + ", submittedAt=" + this.submittedAt + ", form=" + this.form + ", submittedBy=" + this.submittedBy + ", values=" + this.values + ")";
        }
    }

    private static final class FormSubmissionBuilderImpl extends FormSubmissionBuilder<FormSubmission, FormSubmissionBuilderImpl> {
        private FormSubmissionBuilderImpl() {
        }

        protected FormSubmissionBuilderImpl self() {
            return this;
        }

        public FormSubmission build() {
            return new FormSubmission(this);
        }
    }
}
