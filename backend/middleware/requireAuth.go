package middleware

import (
	"fmt"
	"hermes/database"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func RequireAuth(c *gin.Context) {
	tokenString, err := c.Cookie("Auth")
	if err != nil {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	var token *jwt.Token
	var parseErr error

	func() {
		defer func() {
			if r := recover(); r != nil {
				parseErr = fmt.Errorf("failed to parse token: %v", r)
			}
		}()
		token, parseErr = jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(os.Getenv("SECRET")), nil
		})
	}()

	if parseErr != nil {
		// Log the error instead of using log.Fatal
		log.Printf("Error parsing token: %v", parseErr)
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	// Rest of your function remains the same
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid && float64(time.Now().Unix()) < claims["exp"].(float64) {
		var user database.User
		ID, _ := primitive.ObjectIDFromHex(claims["sub"].(string))
		user, err := database.GetUserByID(ID)
		if err != nil {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		c.Set("user", user)
	} else {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	c.Next()
}
