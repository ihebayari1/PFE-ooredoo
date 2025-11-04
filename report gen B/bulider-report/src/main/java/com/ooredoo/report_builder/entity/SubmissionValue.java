package com.ooredoo.report_builder.entity;


import com.ooredoo.report_builder.common.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class SubmissionValue extends BaseEntity {


    private String value;

    @ManyToOne
    @JoinColumn(name = "submission_id")
    private FormSubmission submission;

    @ManyToOne
    @JoinColumn(name = "component_id")
    private FormComponent component;


    public SubmissionValue(String value, FormSubmission submission, FormComponent component) {
        this.value = value;
        this.submission = submission;
        this.component = component;
    }

    public SubmissionValue() {
    }

    protected SubmissionValue(SubmissionValueBuilder<?, ?> b) {
        super(b);
        this.value = b.value;
        this.submission = b.submission;
        this.component = b.component;
    }

    public static SubmissionValueBuilder<?, ?> builder() {
        return new SubmissionValueBuilderImpl();
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

    public void setValue(String value) {
        this.value = value;
    }

    public void setSubmission(FormSubmission submission) {
        this.submission = submission;
    }

    public void setComponent(FormComponent component) {
        this.component = component;
    }

    public static abstract class SubmissionValueBuilder<C extends SubmissionValue, B extends SubmissionValueBuilder<C, B>> extends BaseEntityBuilder<C, B> {
        private String value;
        private FormSubmission submission;
        private FormComponent component;

        public B value(String value) {
            this.value = value;
            return self();
        }

        public B submission(FormSubmission submission) {
            this.submission = submission;
            return self();
        }

        public B component(FormComponent component) {
            this.component = component;
            return self();
        }

        protected abstract B self();

        public abstract C build();

        public String toString() {
            return "SubmissionValue.SubmissionValueBuilder(super=" + super.toString() + ", value=" + this.value + ", submission=" + this.submission + ", component=" + this.component + ")";
        }
    }

    private static final class SubmissionValueBuilderImpl extends SubmissionValueBuilder<SubmissionValue, SubmissionValueBuilderImpl> {
        private SubmissionValueBuilderImpl() {
        }

        protected SubmissionValueBuilderImpl self() {
            return this;
        }

        public SubmissionValue build() {
            return new SubmissionValue(this);
        }
    }
}
