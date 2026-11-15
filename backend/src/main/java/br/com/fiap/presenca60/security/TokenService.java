package br.com.fiap.presenca60.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

// Cria e lê os tokens JWT
@Service
public class TokenService {

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // Cria um token com o e-mail do usuário, válido por 24 horas
    public String generateToken(String email) {
        long oneDay = 24 * 60 * 60 * 1000;
        return Jwts.builder()
                .subject(email)
                .expiration(new Date(System.currentTimeMillis() + oneDay))
                .signWith(getKey())
                .compact();
    }

    // Devolve o e-mail que está dentro do token (ou null se o token for inválido ou expirado)
    public String getEmail(String token) {
        try {
            return Jwts.parser().verifyWith(getKey()).build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
        } catch (Exception e) {
            return null;
        }
    }
}
