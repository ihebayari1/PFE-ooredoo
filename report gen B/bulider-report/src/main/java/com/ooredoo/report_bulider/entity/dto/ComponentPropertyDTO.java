package com.ooredoo.report_bulider.entity.dto;


public class ComponentPropertyDTO {

    private Long id;
    private String propertyName;
    private String propertyValue;
    private Long componentId;

    public ComponentPropertyDTO(Long id, String propertyName, String propertyValue, Long componentId) {
        this.id = id;
        this.propertyName = propertyName;
        this.propertyValue = propertyValue;
        this.componentId = componentId;
    }

    public ComponentPropertyDTO() {
    }

    public static ComponentPropertyDTOBuilder builder() {
        return new ComponentPropertyDTOBuilder();
    }

    public Long getId() {
        return this.id;
    }

    public String getPropertyName() {
        return this.propertyName;
    }

    public String getPropertyValue() {
        return this.propertyValue;
    }

    public Long getComponentId() {
        return this.componentId;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setPropertyName(String propertyName) {
        this.propertyName = propertyName;
    }

    public void setPropertyValue(String propertyValue) {
        this.propertyValue = propertyValue;
    }

    public void setComponentId(Long componentId) {
        this.componentId = componentId;
    }

    public static class ComponentPropertyDTOBuilder {
        private Long id;
        private String propertyName;
        private String propertyValue;
        private Long componentId;

        ComponentPropertyDTOBuilder() {
        }

        public ComponentPropertyDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ComponentPropertyDTOBuilder propertyName(String propertyName) {
            this.propertyName = propertyName;
            return this;
        }

        public ComponentPropertyDTOBuilder propertyValue(String propertyValue) {
            this.propertyValue = propertyValue;
            return this;
        }

        public ComponentPropertyDTOBuilder componentId(Long componentId) {
            this.componentId = componentId;
            return this;
        }

        public ComponentPropertyDTO build() {
            return new ComponentPropertyDTO(this.id, this.propertyName, this.propertyValue, this.componentId);
        }

        public String toString() {
            return "ComponentPropertyDTO.ComponentPropertyDTOBuilder(id=" + this.id + ", propertyName=" + this.propertyName + ", propertyValue=" + this.propertyValue + ", componentId=" + this.componentId + ")";
        }
    }
}
