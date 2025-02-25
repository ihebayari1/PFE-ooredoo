package com.ooredoo.report_bulider.services;


import com.ooredoo.report_bulider.entity.ComponentProperty;
import com.ooredoo.report_bulider.entity.ElementOption;
import com.ooredoo.report_bulider.entity.Form;
import com.ooredoo.report_bulider.entity.FormComponent;
import com.ooredoo.report_bulider.repo.*;
import com.ooredoo.report_bulider.user.User;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FormService {


    private final FormRepository formRepository;
    private final FormComponentRepository componentRepository;
    private final ComponentPropertyRepository propertyRepository;
    private final ElementOptionRepository optionRepository;
    private final UserRepository userRepository;

    public FormService(FormRepository formRepository, FormComponentRepository componentRepository, ComponentPropertyRepository propertyRepository, ElementOptionRepository optionRepository, UserRepository userRepository) {
        this.formRepository = formRepository;
        this.componentRepository = componentRepository;
        this.propertyRepository = propertyRepository;
        this.optionRepository = optionRepository;
        this.userRepository = userRepository;
    }


    public List<Form> getAllForms() {
        return formRepository.findAll();
    }

    public List<Form> getFormsByUser(User user) {
        if (user.hasRole("ADMIN")) {
            return formRepository.findAll();
        } else {
            List<Form> createdForms = formRepository.findByCreator(user);
            List<Form> assignedForms = formRepository.findByAssignedUsersContaining(user);

            // Combine and remove duplicates
            createdForms.addAll(assignedForms);
            return createdForms.stream().distinct().collect(Collectors.toList());
        }
    }

    public Optional<Form> getFormById(Long id) {
        return formRepository.findById(id);
    }

    @Transactional
    public Form createForm(Form form, User createdBy) {
        form.setCreator(createdBy);
        return formRepository.save(form);
    }

    @Transactional
    public Form updateForm(Form form) {
        return formRepository.save(form);
    }

    @Transactional
    public void deleteForm(Long id) {
        formRepository.deleteById(id);
    }

    @Transactional
    public ComponentProperty addElementProperty(Long elementId, ComponentProperty property) {
        FormComponent element = componentRepository.findById(elementId)
                .orElseThrow(() -> new RuntimeException("Element not found"));

        property.setComponent(element);
        return propertyRepository.save(property);
    }

    @Transactional
    public void updateElementProperty(Long propertyId, String propertyValue) {
        ComponentProperty property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        property.setPropertyValue(propertyValue);
        propertyRepository.save(property);
    }

    @Transactional
    public ElementOption addElementOption(Long elementId, ElementOption option) {
        FormComponent element = componentRepository.findById(elementId)
                .orElseThrow(() -> new RuntimeException("Element not found"));

        option.setComponent(element);

        // Get the highest current display order and add 1
        Integer maxDisplayOrder = optionRepository.findByComponentIdOrderByDisplayOrderAsc(elementId)
                .stream()
                .map(ElementOption::getDisplayOrder)
                .max(Integer::compareTo)
                .orElse(0);

        option.setDisplayOrder(maxDisplayOrder + 1);

        return optionRepository.save(option);
    }

    @Transactional
    public void updateElementOption(Long optionId, String label, String value) {
        ElementOption option = optionRepository.findById(optionId)
                .orElseThrow(() -> new RuntimeException("Option not found"));

        option.setLabel(label);
        option.setValue(value);
        optionRepository.save(option);
    }

    @Transactional
    public void assignFormToUsers(Long formId, List<Integer> userIds) {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found"));

        List<User> users = userRepository.findAllById(userIds);
        form.getAssignedUsers().addAll(users);

        formRepository.save(form);
    }

    @Transactional
    public void unassignFormFromUser(Long formId, Integer userId) {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        form.getAssignedUsers().remove(user);
        formRepository.save(form);
    }


    public List<FormComponent> getFormElements(Long formId) {
        return componentRepository.findByFormIdOrderByOrderIndexAsc(formId);
    }

    public List<ComponentProperty> getElementProperties(Long elementId) {
        return propertyRepository.findByComponentId(elementId);
    }

    public List<ElementOption> getElementOptions(Long elementId) {
        return optionRepository.findByComponentIdOrderByDisplayOrderAsc(elementId);
    }
}


