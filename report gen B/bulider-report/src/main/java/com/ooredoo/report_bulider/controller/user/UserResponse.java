package com.ooredoo.report_bulider.controller.user;

import java.util.List;

public class UserResponse {
    private Integer id_user;
    private String firstname;
    private String lastname;
    private String email;
    private String departmentName;
    private List<String> roles;

    UserResponse(Integer id_user, String firstname, String lastname, String email, String departmentName, List<String> roles) {
        this.id_user = id_user;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.departmentName = departmentName;
        this.roles = roles;
    }

    public static UserResponseBuilder builder() {
        return new UserResponseBuilder();
    }


    public Integer getId_user() {
        return this.id_user;
    }

    public String getFirstname() {
        return this.firstname;
    }

    public String getLastname() {
        return this.lastname;
    }

    public String getEmail() {
        return this.email;
    }

    public String getDepartmentName() {
        return this.departmentName;
    }

    public List<String> getRoles() {
        return this.roles;
    }

    public void setId_user(Integer id_user) {
        this.id_user = id_user;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public static class UserResponseBuilder {
        private Integer id_user;
        private String firstname;
        private String lastname;
        private String email;
        private String departmentName;
        private List<String> roles;

        UserResponseBuilder() {
        }

        public UserResponseBuilder id_user(Integer id_user) {
            this.id_user = id_user;
            return this;
        }

        public UserResponseBuilder firstname(String firstname) {
            this.firstname = firstname;
            return this;
        }

        public UserResponseBuilder lastname(String lastname) {
            this.lastname = lastname;
            return this;
        }

        public UserResponseBuilder email(String email) {
            this.email = email;
            return this;
        }

        public UserResponseBuilder departmentName(String departmentName) {
            this.departmentName = departmentName;
            return this;
        }

        public UserResponseBuilder roles(List<String> roles) {
            this.roles = roles;
            return this;
        }

        public UserResponse build() {
            return new UserResponse(this.id_user, this.firstname, this.lastname, this.email, this.departmentName, this.roles);
        }

        public String toString() {
            return "UserResponse.UserResponseBuilder(id_user=" + this.id_user + ", firstname=" + this.firstname + ", lastname=" + this.lastname + ", email=" + this.email + ", departmentName=" + this.departmentName + ", roles=" + this.roles + ")";
        }
    }
}
