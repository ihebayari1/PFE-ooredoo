package com.ooredoo.report_bulider.entity.dto;


public class ElementOptionDTO {
    private Long id;
    private String label;
    private String value;
    private Integer displayOrder;
    private Long componentId;

    public ElementOptionDTO(Long id, String label, String value, Integer displayOrder, Long componentId) {
        this.id = id;
        this.label = label;
        this.value = value;
        this.displayOrder = displayOrder;
        this.componentId = componentId;
    }

    public ElementOptionDTO() {
    }

    public static ElementOptionDTOBuilder builder() {
        return new ElementOptionDTOBuilder();
    }

    public Long getId() {
        return this.id;
    }

    public String getLabel() {
        return this.label;
    }

    public String getValue() {
        return this.value;
    }

    public Integer getDisplayOrder() {
        return this.displayOrder;
    }

    public Long getComponentId() {
        return this.componentId;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public void setComponentId(Long componentId) {
        this.componentId = componentId;
    }

    public static class ElementOptionDTOBuilder {
        private Long id;
        private String label;
        private String value;
        private Integer displayOrder;
        private Long componentId;

        ElementOptionDTOBuilder() {
        }

        public ElementOptionDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ElementOptionDTOBuilder label(String label) {
            this.label = label;
            return this;
        }

        public ElementOptionDTOBuilder value(String value) {
            this.value = value;
            return this;
        }

        public ElementOptionDTOBuilder displayOrder(Integer displayOrder) {
            this.displayOrder = displayOrder;
            return this;
        }

        public ElementOptionDTOBuilder componentId(Long componentId) {
            this.componentId = componentId;
            return this;
        }

        public ElementOptionDTO build() {
            return new ElementOptionDTO(this.id, this.label, this.value, this.displayOrder, this.componentId);
        }

        public String toString() {
            return "ElementOptionDTO.ElementOptionDTOBuilder(id=" + this.id + ", label=" + this.label + ", value=" + this.value + ", displayOrder=" + this.displayOrder + ", componentId=" + this.componentId + ")";
        }
    }
}
