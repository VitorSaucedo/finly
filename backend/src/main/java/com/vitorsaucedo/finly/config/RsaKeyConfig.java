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
            byte[] der = resolveKeyBytes(publicKeyLocation, publicKey);
            return KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(der));
        } catch (Exception e) {
            throw new IllegalStateException("Falha ao carregar RSA public key", e);
        }
    }

    public PrivateKey privateKey() {
        try {
            byte[] der = resolveKeyBytes(privateKeyLocation, privateKey);
            return KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(der));
        } catch (Exception e) {
            throw new IllegalStateException("Falha ao carregar RSA private key", e);
        }
    }

    private byte[] resolveKeyBytes(Resource location, String base64String) throws Exception {
        if (location != null) {
            String pem = new String(location.getInputStream().readAllBytes());
            return Base64.getDecoder().decode(stripPemHeaders(pem));
        }
        if (base64String != null && !base64String.isBlank()) {
            String pem = new String(Base64.getDecoder().decode(base64String.trim()));
            return Base64.getDecoder().decode(stripPemHeaders(pem));
        }
        throw new IllegalStateException("Nenhuma chave RSA configurada (nem location nem string base64)");
    }

    private String stripPemHeaders(String pem) {
        return pem.replaceAll("-----.*?-----", "").replaceAll("\\s", "");
    }
}