package com.ooredoo.report_bulider.entity.dto;

import java.time.LocalDateTime;
import java.util.List;

public class FormSubmissionDTO {

    private Long id;
    private LocalDateTime submittedAt;
    private Long formId; // Only expose the form's ID
    private Integer submittedById;
    private List<SubmissionValueDTO> values;


    public FormSubmissionDTO() {
    }

    public FormSubmissionDTO(Long id, LocalDateTime submittedAt, Long formId, Integer submittedById, List<SubmissionValueDTO> values) {
        this.id = id;
        this.submittedAt = submittedAt;
        this.formId = formId;
        this.submittedById = submittedById;
        this.values = values;
    }

    public static FormSubmissionDTOBuilder builder() {
        return new FormSubmissionDTOBuilder();
    }

    public Long getId() {
        return this.id;
    }

    public LocalDateTime getSubmittedAt() {
        return this.submittedAt;
    }

    public Long getFormId() {
        return this.formId;
    }

    public Integer getSubmittedById() {
        return this.submittedById;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public void setFormId(Long formId) {
        this.formId = formId;
    }

    public void setSubmittedById(Integer submittedById) {
        this.submittedById = submittedById;
    }

    public List<SubmissionValueDTO> getValues() {
        return this.values;
    }

    public void setValues(List<SubmissionValueDTO> values) {
        this.values = values;
    }


    public static class FormSubmissionDTOBuilder {
        private Long id;
        private LocalDateTime submittedAt;
        private Long formId;
        private Integer submittedById;
        private List<SubmissionValueDTO> values;

        FormSubmissionDTOBuilder() {
        }

        public FormSubmissionDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public FormSubmissionDTOBuilder submittedAt(LocalDateTime submittedAt) {
            this.submittedAt = submittedAt;
            return this;
        }

        public FormSubmissionDTOBuilder formId(Long formId) {
            this.formId = formId;
            return this;
        }

        public FormSubmissionDTOBuilder submittedById(Integer submittedById) {
            this.submittedById = submittedById;
            return this;
        }

        public FormSubmissionDTOBuilder values(List<SubmissionValueDTO> values) {
            this.values = values;
            return this;
        }

        public FormSubmissionDTO build() {
            return new FormSubmissionDTO(this.id, this.submittedAt, this.formId, this.submittedById, this.values);
        }

        public String toString() {
            return "FormSubmissionDTO.FormSubmissionDTOBuilder(id=" + this.id + ", submittedAt=" + this.submittedAt + ", formId=" + this.formId + ", submittedById=" + this.submittedById + ", values=" + this.values + ")";
        }
    }
}
