package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Authentication required",
			})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)

		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid authorization header",
			})
			c.Abort()
			return
		}

		tokenString := strings.TrimSpace(parts[1])

		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Authentication token is missing",
			})
			c.Abort()
			return
		}

		jwtSecret := os.Getenv("JWT_SECRET")

		if jwtSecret == "" {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Authentication is not configured",
			})
			c.Abort()
			return
		}

		token, err := jwt.Parse(
			tokenString,
			func(token *jwt.Token) (interface{}, error) {
				if token.Method != jwt.SigningMethodHS256 {
					return nil, jwt.ErrSignatureInvalid
				}

				return []byte(jwtSecret), nil
			},
		)

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid or expired authentication token",
			})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)

		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid authentication claims",
			})
			c.Abort()
			return
		}

		role, ok := claims["role"].(string)

		if !ok || role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Admin access required",
			})
			c.Abort()
			return
		}

		username, _ := claims["sub"].(string)

		c.Set("admin_username", username)
		c.Set("admin_role", role)

		c.Next()
	}
}
