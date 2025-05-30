package com.ooredoo.report_bulider.handler;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_IMPLEMENTED;

public enum BusinessErrorCode {
    
    NO_CODE(0, "No code", NOT_IMPLEMENTED),
    INCORRECT_CURRENT_PASSWORD(300, "Current password is incorrect", BAD_REQUEST),
    NEW_PASSWORD_DOES_NOT_MATCH(301, "The new password does not match", BAD_REQUEST),
    ACCOUNT_LOCKED(302, "User account is locked", FORBIDDEN),
    ACCOUNT_DISABLED(303, "User account is disabled", FORBIDDEN),
    BAD_CREDENTIALS(304, "Login and / or Password is incorrect", FORBIDDEN),
    ;

    private final int code;

    private final String description;

    private final HttpStatus httpStatus;

    BusinessErrorCode(int code, String description, HttpStatus httpStatus) {
        this.code = code;
        this.description = description;
        this.httpStatus = httpStatus;
    }

    public int getCode() {
        return this.code;
    }

    public String getDescription() {
        return this.description;
    }

    public HttpStatus getHttpStatus() {
        return this.httpStatus;
    }
}
