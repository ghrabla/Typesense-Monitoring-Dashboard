package service

import (
	"crypto/subtle"
	"errors"
	"time"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/config"
	"github.com/golang-jwt/jwt/v5"
)

var ErrInvalidCredentials = errors.New("invalid username or password")
var ErrInvalidToken = errors.New("invalid or expired token")

type AuthService struct {
	cfg *config.Config
}

func NewAuthService(cfg *config.Config) *AuthService {
	return &AuthService{cfg: cfg}
}

func (s *AuthService) Login(username, password string) (string, int64, error) {
	validUsername := subtle.ConstantTimeCompare([]byte(username), []byte(s.cfg.AdminUsername)) == 1
	validPassword := subtle.ConstantTimeCompare([]byte(password), []byte(s.cfg.AdminPassword)) == 1
	if !validUsername || !validPassword {
		return "", 0, ErrInvalidCredentials
	}

	expiresAt := time.Now().Add(s.cfg.TokenTTL)
	claims := jwt.RegisteredClaims{
		Subject:   username,
		ExpiresAt: jwt.NewNumericDate(expiresAt),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return "", 0, err
	}

	return signed, expiresAt.Unix(), nil
}

func (s *AuthService) ValidateToken(tokenString string) (string, error) {
	claims := &jwt.RegisteredClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(s.cfg.JWTSecret), nil
	})
	if err != nil || !token.Valid {
		return "", ErrInvalidToken
	}

	return claims.Subject, nil
}
