package com.vitorsaucedo.finly.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.core.io.Resource;

import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@ConfigurationProperties(prefix = "app.rsa")
public record RsaKeyConfig(Resource publicKeyLocation, Resource privateKeyLocation) {

    public PublicKey publicKey() {
        try {
            String key = new String(publicKeyLocation.getInputStream().readAllBytes())
                    .replaceAll("-----.*-----", "")
                    .replaceAll("\\s", "");
            byte[] decoded = Base64.getDecoder().decode(key);
            return KeyFactory.getInstance("RSA")
                    .generatePublic(new X509EncodedKeySpec(decoded));
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load RSA public key", e);
        }
    }

    public PrivateKey privateKey() {
        try {
            String key = new String(privateKeyLocation.getInputStream().readAllBytes())
                    .replaceAll("-----.*-----", "")
                    .replaceAll("\\s", "");
            byte[] decoded = Base64.getDecoder().decode(key);
            return KeyFactory.getInstance("RSA")
                    .generatePrivate(new PKCS8EncodedKeySpec(decoded));
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load RSA private key", e);
        }
    }
}