package controller

import (
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthController struct {
	adminUsername     string
	adminPasswordHash string
	jwtSecret         string
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func NewAuthController() *AuthController {
	return &AuthController{
		adminUsername:     os.Getenv("ADMIN_USERNAME"),
		adminPasswordHash: os.Getenv("ADMIN_PASSWORD_HASH"),
		jwtSecret:         os.Getenv("JWT_SECRET"),
	}
}

func (a *AuthController) Login(c *gin.Context) {
	var request LoginRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid login request",
		})
		return
	}

	username := strings.TrimSpace(request.Username)

	if username == "" || request.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Username and password are required",
		})
		return
	}

	if a.adminUsername == "" ||
		a.adminPasswordHash == "" ||
		a.jwtSecret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Authentication is not configured",
		})
		return
	}

	if username != a.adminUsername {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid username or password",
		})
		return
	}

	err := bcrypt.CompareHashAndPassword(
		[]byte(a.adminPasswordHash),
		[]byte(request.Password),
	)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid username or password",
		})
		return
	}

	now := time.Now()
	expiresAt := now.Add(8 * time.Hour)

	claims := jwt.MapClaims{
		"sub":  username,
		"role": "admin",
		"iat":  now.Unix(),
		"exp":  expiresAt.Unix(),
	}

	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		claims,
	)

	signedToken, err := token.SignedString([]byte(a.jwtSecret))

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Unable to create authentication token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Login successful",
		"token":   signedToken,
		"expires": expiresAt,
		"user": gin.H{
			"username": username,
			"role":     "admin",
		},
	})
}
