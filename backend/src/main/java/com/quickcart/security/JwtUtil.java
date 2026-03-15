package com.quickcart.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret:94a08da1d1f057863bf6d5a1b94b0d775ea0bd6eb63c46e30b42ddc3f25c7423}")
    private String secret;

    @Value("${jwt.expirationMs:86400000}")
    private long jwtExpirationMs;

    private Key getSigningKey() {
        if (secret.length() < 32) {
            secret = "94a08da1d1f057863bf6d5a1b94b0d775ea0bd6eb63c46e30b42ddc3f25c7423";
        }
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String username, String role, String name, String mobileNumber) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .claim("name", name)
                .claim("mobileNumber", mobileNumber)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody();
    }

    public boolean isTokenValid(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}
