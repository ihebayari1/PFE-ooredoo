package com.ooredoo.report_builder.config;


import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;

@OpenAPIDefinition(
        info = @Info(
                contact = @Contact(
                        name = "iheb Ayari",
                        email = "iheb.ayari@esprit.tn"
                ),
                description = "OpenApi documentation for Spring PFE",
                title = "OpenApi specification for PFE",
                version = "1.0",
                license = @License(
                        name = "ooredoo PFE"
                ),
                termsOfService = "PFE OORedOO"
        ),
        servers = {
                @Server(
                        description = "local ENV",
                        url = "http://localhost:8080/api/V1"
                )
        },
        security = {
                @SecurityRequirement(
                        name = "bearerAuth"
                )
        }
    )
@SecurityScheme(
        name  = "bearerAuth",
        description = "JWT auth description",
        scheme = "bearer",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER
    )
public class OpenApiConfig {
}
