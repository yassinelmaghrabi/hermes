package middleware

import (
	"hermes/database"
	"hermes/helpers"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func AuthenticationMiddleware(secretKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		var authHeader string
		authHeader = c.GetHeader("Authorization")

		if authHeader == "" {
			authHeader = c.GetHeader("token")
			if authHeader == "" {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token cannot be empty"})
				return
			}
		}

		bearerToken := strings.Split(authHeader, " ")
		if len(bearerToken) < 2 || bearerToken[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token is not supported or badly formated"})
			return
		}

		tokenString := bearerToken[1]

		token, err := helpers.ValidateToken(tokenString, secretKey)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || !token.Valid || float64(time.Now().Unix()) > claims["exp"].(float64) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		ID, _ := primitive.ObjectIDFromHex(claims["sub"].(string))

		user, err := database.GetUserByID(ID)

		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			return
		}

		c.Set("user", user)
		c.Set("userID", user.ID)
		c.Set("role", user.Role)
		c.Next()

	}
}
