package com.ooredoo.report_bulider.controller.user;

public class UserUpdateRequest {

    private String firstname;
    private String lastname;
    private Integer departmentId;

    UserUpdateRequest(String firstname, String lastname, Integer departmentId) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.departmentId = departmentId;
    }

    public static UserUpdateRequestBuilder builder() {
        return new UserUpdateRequestBuilder();
    }

    public String getFirstname() {
        return this.firstname;
    }

    public String getLastname() {
        return this.lastname;
    }

    public Integer getDepartmentId() {
        return this.departmentId;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public void setDepartmentId(Integer departmentId) {
        this.departmentId = departmentId;
    }

    public static class UserUpdateRequestBuilder {
        private String firstname;
        private String lastname;
        private Integer departmentId;

        UserUpdateRequestBuilder() {
        }

        public UserUpdateRequestBuilder firstname(String firstname) {
            this.firstname = firstname;
            return this;
        }

        public UserUpdateRequestBuilder lastname(String lastname) {
            this.lastname = lastname;
            return this;
        }

        public UserUpdateRequestBuilder departmentId(Integer departmentId) {
            this.departmentId = departmentId;
            return this;
        }

        public UserUpdateRequest build() {
            return new UserUpdateRequest(this.firstname, this.lastname, this.departmentId);
        }

        public String toString() {
            return "UserUpdateRequest.UserUpdateRequestBuilder(firstname=" + this.firstname + ", lastname=" + this.lastname + ", departmentId=" + this.departmentId + ")";
        }
    }
}
