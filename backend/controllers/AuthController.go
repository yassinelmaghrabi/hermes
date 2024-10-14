package controllers

import (
	"hermes/database"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"golang.org/x/crypto/bcrypt"
)

func Login(c *gin.Context) {
	var creds struct {
		Username string `bson:"username"`
		Password string `bson:"password"`
	}
	if c.ShouldBindJSON(&creds) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to read body",
		})
		return
	}
	user, err := database.GetUserByUsername(creds.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": creds.Username + "User does not exist"})
		return
	}
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(creds.Password))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid User or Password"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(time.Hour * 24 * 30).Unix(),
	})
	tokenString, err := token.SignedString([]byte(os.Getenv("SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to return token"})
		return
	}
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("Auth", tokenString, 3600*24*30, "", "", false, true)
	c.JSON(http.StatusOK, gin.H{
		"Authorization": "Bearer " + tokenString,
	})

}
