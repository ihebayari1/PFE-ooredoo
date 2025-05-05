package com.ooredoo.report_bulider.controller.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public class UserCreateRequest {

    private String firstname;
    private String lastname;
    private LocalDate dateOfBirth;
    @Email(message = "Email is not well formatted")
    @NotEmpty(message = "Email is mandatory")
    @NotNull(message = "Email is mandatory")
    private String email;

    @NotEmpty(message = "Password is mandatory")
    @NotNull(message = "Password is mandatory")
    @Size(min = 8, message = "Password should be 8 characters long minimum")
    private String password;
    private int departmentId;
    private List<String> roles;

    UserCreateRequest(String firstname, String lastname, LocalDate dateOfBirth, @Email(message = "Email is not well formatted") @NotEmpty(message = "Email is mandatory") @NotNull(message = "Email is mandatory") String email, @NotEmpty(message = "Password is mandatory") @NotNull(message = "Password is mandatory") @Size(min = 8, message = "Password should be 8 characters long minimum") String password, int departmentId, List<String> roles) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.dateOfBirth = dateOfBirth;
        this.email = email;
        this.password = password;
        this.departmentId = departmentId;
        this.roles = roles;
    }

    public static UserCreateRequestBuilder builder() {
        return new UserCreateRequestBuilder();
    }

    public String getFirstname() {
        return this.firstname;
    }

    public String getLastname() {
        return this.lastname;
    }

    public LocalDate getDateOfBirth() {
        return this.dateOfBirth;
    }

    public @Email(message = "Email is not well formatted") @NotEmpty(message = "Email is mandatory") @NotNull(message = "Email is mandatory") String getEmail() {
        return this.email;
    }

    public @NotEmpty(message = "Password is mandatory") @NotNull(message = "Password is mandatory") @Size(min = 8, message = "Password should be 8 characters long minimum") String getPassword() {
        return this.password;
    }

    public int getDepartmentId() {
        return this.departmentId;
    }

    public List<String> getRoles() {
        return this.roles;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public void setEmail(@Email(message = "Email is not well formatted") @NotEmpty(message = "Email is mandatory") @NotNull(message = "Email is mandatory") String email) {
        this.email = email;
    }

    public void setPassword(@NotEmpty(message = "Password is mandatory") @NotNull(message = "Password is mandatory") @Size(min = 8, message = "Password should be 8 characters long minimum") String password) {
        this.password = password;
    }

    public void setDepartmentId(int departmentId) {
        this.departmentId = departmentId;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public static class UserCreateRequestBuilder {
        private String firstname;
        private String lastname;
        private LocalDate dateOfBirth;
        private @Email(message = "Email is not well formatted")
        @NotEmpty(message = "Email is mandatory")
        @NotNull(message = "Email is mandatory") String email;
        private @NotEmpty(message = "Password is mandatory")
        @NotNull(message = "Password is mandatory")
        @Size(min = 8, message = "Password should be 8 characters long minimum") String password;
        private int departmentId;
        private List<String> roles;

        UserCreateRequestBuilder() {
        }

        public UserCreateRequestBuilder firstname(String firstname) {
            this.firstname = firstname;
            return this;
        }

        public UserCreateRequestBuilder lastname(String lastname) {
            this.lastname = lastname;
            return this;
        }

        public UserCreateRequestBuilder dateOfBirth(LocalDate dateOfBirth) {
            this.dateOfBirth = dateOfBirth;
            return this;
        }

        public UserCreateRequestBuilder email(@Email(message = "Email is not well formatted") @NotEmpty(message = "Email is mandatory") @NotNull(message = "Email is mandatory") String email) {
            this.email = email;
            return this;
        }

        public UserCreateRequestBuilder password(@NotEmpty(message = "Password is mandatory") @NotNull(message = "Password is mandatory") @Size(min = 8, message = "Password should be 8 characters long minimum") String password) {
            this.password = password;
            return this;
        }

        public UserCreateRequestBuilder departmentId(int departmentId) {
            this.departmentId = departmentId;
            return this;
        }

        public UserCreateRequestBuilder roles(List<String> roles) {
            this.roles = roles;
            return this;
        }

        public UserCreateRequest build() {
            return new UserCreateRequest(this.firstname, this.lastname, this.dateOfBirth, this.email, this.password, this.departmentId, this.roles);
        }

        public String toString() {
            return "UserCreateRequest.UserCreateRequestBuilder(firstname=" + this.firstname + ", lastname=" + this.lastname + ", dateOfBirth=" + this.dateOfBirth + ", email=" + this.email + ", password=" + this.password + ", departmentId=" + this.departmentId + ", roles=" + this.roles + ")";
        }
    }
}
