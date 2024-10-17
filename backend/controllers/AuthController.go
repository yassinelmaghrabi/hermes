package controllers

import (
	"hermes/database"
	"hermes/helpers"
	emailhelper "hermes/helpers"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"go.mongodb.org/mongo-driver/bson"
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
	c.JSON(http.StatusOK, gin.H{
		"token": "Bearer " + tokenString,
	})

}

func RequestResetPassword(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"omitempty,email"`
		Username string `json:"username" binding:"omitempty"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Email == "" && req.Username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Both Email and Username cannot be empty"})
		return
	}

	user, err := database.GetUserByUsernameOrEmail(req.Username, req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

	token := helpers.GenerateRandomToken(32)

	updatedData := bson.M{
		"passwordResetToken":   token,
		"passwordResetExpires": time.Now().Add(time.Minute * 20),
	}

	_, err = database.UpdateUser(user.ID, updatedData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "somthing wentwrong"})
		return
	}

	err = emailhelper.InitSMTPSender(
		os.Getenv("SMTP_HOST"),
		587,
		os.Getenv("SMTP_USERNAME"),
		os.Getenv("SMTP_PASSWORD"),
	).SendPasswordResetEmail(user.Email, "http://localhost:3000/reset-password?token="+token)

	if err != nil {
		updatedData := bson.M{
			"passwordResetToken":   bson.TypeNull,
			"passwordResetExpires": bson.TypeNull,
		}

		_, err = database.UpdateUser(user.ID, updatedData)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password reset request sent"})
}

func ResetPassword(c *gin.Context) {
	var req struct {
		Password string `json:"password" binding:"required"`
	}
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token is required"})
		return
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := database.GetUserByPasswordResetToken(token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid token or expired"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	updatedData := bson.M{
		"password":             string(hashedPassword),
		"passwordResetToken":   bson.TypeNull,
		"passwordResetExpires": bson.TypeNull,
	}

	_, err = database.UpdateUser(user.ID, updatedData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reset password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password reset successful"})
}
