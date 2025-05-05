package com.ooredoo.report_bulider.entity.dto;


import java.util.List;

public class FormComponentDTO {

    private Long id;
    private String elementType;
    private String label;
    private Boolean required;
    private List<ComponentPropertyDTO> properties;
    private List<ElementOptionDTO> options;
    private Long formId;


    public FormComponentDTO() {
    }

    public static FormComponentDTOBuilder builder() {
        return new FormComponentDTOBuilder();
    }

    public Long getId() {
        return this.id;
    }

    public String getElementType() {
        return this.elementType;
    }

    public String getLabel() {
        return this.label;
    }


    public Boolean getRequired() {
        return this.required;
    }

    public Long getFormId() {
        return this.formId;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setElementType(String elementType) {
        this.elementType = elementType;
    }

    public void setLabel(String label) {
        this.label = label;
    }


    public void setRequired(Boolean required) {
        this.required = required;
    }

    public void setFormId(Long formId) {
        this.formId = formId;
    }

    public List<ComponentPropertyDTO> getProperties() {
        return this.properties;
    }

    public List<ElementOptionDTO> getOptions() {
        return this.options;
    }

    public void setProperties(List<ComponentPropertyDTO> properties) {
        this.properties = properties;
    }

    public void setOptions(List<ElementOptionDTO> options) {
        this.options = options;
    }

    public static class FormComponentDTOBuilder {
        private Long id;
        private String elementType;
        private String label;
        private Boolean required;
        private Long formId;
        private List<ComponentPropertyDTO> properties;
        private List<ElementOptionDTO> options;

        FormComponentDTOBuilder() {
        }

        public FormComponentDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public FormComponentDTOBuilder elementType(String elementType) {
            this.elementType = elementType;
            return this;
        }

        public FormComponentDTOBuilder label(String label) {
            this.label = label;
            return this;
        }


        public FormComponentDTOBuilder required(Boolean required) {
            this.required = required;
            return this;
        }

        public FormComponentDTOBuilder formId(Long formId) {
            this.formId = formId;
            return this;
        }


        public String toString() {
            return "FormComponentDTO.FormComponentDTOBuilder(id=" + this.id + ", elementType=" + this.elementType + ", label=" + this.label + ", required=" + this.required + ", formId=" + this.formId + ")";
        }

        public FormComponentDTOBuilder properties(List<ComponentPropertyDTO> properties) {
            this.properties = properties;
            return this;
        }

        public FormComponentDTOBuilder options(List<ElementOptionDTO> options) {
            this.options = options;
            return this;
        }
    }
}
