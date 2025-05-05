package com.ooredoo.report_bulider.entity.dto;

public class SubmissionValueDTO {

    private Long id;
    private String value;
    private Long submissionId; // Only expose the submission's ID
    private Long componentId;

    public SubmissionValueDTO(Long id, String value, Long submissionId, Long componentId) {
        this.id = id;
        this.value = value;
        this.submissionId = submissionId;
        this.componentId = componentId;
    }

    public SubmissionValueDTO() {
    }

    public static SubmissionValueDTOBuilder builder() {
        return new SubmissionValueDTOBuilder();
    }

    public Long getId() {
        return this.id;
    }

    public String getValue() {
        return this.value;
    }

    public Long getSubmissionId() {
        return this.submissionId;
    }

    public Long getComponentId() {
        return this.componentId;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public void setSubmissionId(Long submissionId) {
        this.submissionId = submissionId;
    }

    public void setComponentId(Long componentId) {
        this.componentId = componentId;
    }

    public static class SubmissionValueDTOBuilder {
        private Long id;
        private String value;
        private Long submissionId;
        private Long componentId;

        SubmissionValueDTOBuilder() {
        }

        public SubmissionValueDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public SubmissionValueDTOBuilder value(String value) {
            this.value = value;
            return this;
        }

        public SubmissionValueDTOBuilder submissionId(Long submissionId) {
            this.submissionId = submissionId;
            return this;
        }

        public SubmissionValueDTOBuilder componentId(Long componentId) {
            this.componentId = componentId;
            return this;
        }

        public SubmissionValueDTO build() {
            return new SubmissionValueDTO(this.id, this.value, this.submissionId, this.componentId);
        }

        public String toString() {
            return "SubmissionValueDTO.SubmissionValueDTOBuilder(id=" + this.id + ", value=" + this.value + ", submissionId=" + this.submissionId + ", componentId=" + this.componentId + ")";
        }
    }
}
