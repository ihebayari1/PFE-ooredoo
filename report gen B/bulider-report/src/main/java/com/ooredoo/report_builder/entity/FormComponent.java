package com.ooredoo.report_builder.entity;

import com.ooredoo.report_builder.common.BaseEntity;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "form_components")
public class FormComponent extends BaseEntity {

    private String elementType; // TEXT, NUMBER, DROPDOWN, etc.
    private String label;
    private Integer orderIndex;
    private Boolean required = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id")
    private Form form;

    @OneToMany(mappedBy = "component", cascade = CascadeType.ALL)
    private List<ComponentProperty> properties;

    @OneToMany(mappedBy = "component", cascade = CascadeType.ALL)
    private List<ElementOption> options;

    public FormComponent(String elementType, String label, Integer orderIndex, Boolean required, Form form, List<ComponentProperty> properties, List<ElementOption> options) {
        this.elementType = elementType;
        this.label = label;
        this.orderIndex = orderIndex;
        this.required = required;
        this.form = form;
        this.properties = properties;
        this.options = options;
    }

    public FormComponent() {
    }

    protected FormComponent(FormComponentBuilder<?, ?> b) {
        super(b);
        this.elementType = b.elementType;
        this.label = b.label;
        this.orderIndex = b.orderIndex;
        this.required = b.required;
        this.form = b.form;
        this.properties = b.properties;
        this.options = b.options;
    }

    public static FormComponentBuilder<?, ?> builder() {
        return new FormComponentBuilderImpl();
    }

    public String getElementType() {
        return this.elementType;
    }

    public String getLabel() {
        return this.label;
    }

    public Integer getOrderIndex() {
        return this.orderIndex;
    }

    public Boolean getRequired() {
        return this.required;
    }


    public Form getForm() {
        return this.form;
    }

    public List<ComponentProperty> getProperties() {
        return this.properties;
    }

    public List<ElementOption> getOptions() {
        return this.options;
    }

    public void setElementType(String elementType) {
        this.elementType = elementType;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }

    public void setRequired(Boolean required) {
        this.required = required;
    }


    public void setForm(Form form) {
        this.form = form;
    }

    public void setProperties(List<ComponentProperty> properties) {
        this.properties = properties;
    }

    public void setOptions(List<ElementOption> options) {
        this.options = options;
    }

    public static abstract class FormComponentBuilder<C extends FormComponent, B extends FormComponentBuilder<C, B>> extends BaseEntityBuilder<C, B> {
        private String elementType;
        private String label;
        private Integer orderIndex;
        private Boolean required;
        private Form form;
        private List<ComponentProperty> properties;
        private List<ElementOption> options;

        public B elementType(String elementType) {
            this.elementType = elementType;
            return self();
        }

        public B label(String label) {
            this.label = label;
            return self();
        }

        public B orderIndex(Integer orderIndex) {
            this.orderIndex = orderIndex;
            return self();
        }

        public B required(Boolean required) {
            this.required = required;
            return self();
        }


        public B form(Form form) {
            this.form = form;
            return self();
        }

        public B properties(List<ComponentProperty> properties) {
            this.properties = properties;
            return self();
        }

        public B options(List<ElementOption> options) {
            this.options = options;
            return self();
        }

        protected abstract B self();

        public abstract C build();

        public String toString() {
            return "FormComponent.FormComponentBuilder(super=" + super.toString() + ", elementType=" + this.elementType + ", label=" + this.label + ", orderIndex=" + this.orderIndex + ", required=" + this.required  + ", form=" + this.form + ", properties=" + this.properties + ", options=" + this.options + ")";
        }
    }

    private static final class FormComponentBuilderImpl extends FormComponentBuilder<FormComponent, FormComponentBuilderImpl> {
        private FormComponentBuilderImpl() {
        }

        protected FormComponentBuilderImpl self() {
            return this;
        }

        public FormComponent build() {
            return new FormComponent(this);
        }
    }
}
