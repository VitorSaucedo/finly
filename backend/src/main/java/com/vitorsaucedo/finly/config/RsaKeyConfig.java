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
public class RsaKeyConfig {

    private Resource publicKeyLocation;
    private Resource privateKeyLocation;

    private String publicKey;
    private String privateKey;

    public void setPublicKeyLocation(Resource publicKeyLocation) {
        this.publicKeyLocation = publicKeyLocation;
    }

    public void setPrivateKeyLocation(Resource privateKeyLocation) {
        this.privateKeyLocation = privateKeyLocation;
    }

    public void setPublicKey(String publicKey) {
        this.publicKey = publicKey;
    }

    public void setPrivateKey(String privateKey) {
        this.privateKey = privateKey;
    }

    public PublicKey publicKey() {
        try {
            String raw = resolveKeyString(publicKeyLocation, publicKey);
            byte[] decoded = Base64.getDecoder().decode(stripPemHeaders(raw));
            return KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(decoded));
        } catch (Exception e) {
            throw new IllegalStateException("Falha ao carregar RSA public key", e);
        }
    }

    public PrivateKey privateKey() {
        try {
            String raw = resolveKeyString(privateKeyLocation, privateKey);
            byte[] decoded = Base64.getDecoder().decode(stripPemHeaders(raw));
            return KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(decoded));
        } catch (Exception e) {
            throw new IllegalStateException("Falha ao carregar RSA private key", e);
        }
    }

    private String resolveKeyString(Resource location, String fallbackString) throws Exception {
        if (location != null) {
            return new String(location.getInputStream().readAllBytes());
        }
        if (fallbackString != null && !fallbackString.isBlank()) {
            return fallbackString;
        }
        throw new IllegalStateException("Nenhuma chave RSA configurada (nem location nem string base64)");
    }

    private String stripPemHeaders(String key) {
        return key.replaceAll("-----.*?-----", "").replaceAll("\\s", "");
    }
}