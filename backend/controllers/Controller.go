package controllers

import (
	"hermes/database"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

func HealthCheck(c *gin.Context) {
	var mongoStatus string = "MongoDB is up and running"
	if database.Ping() != nil {
		mongoStatus = "MongoDB is down"
	}

	c.JSON(http.StatusOK, gin.H{
		"API":     "API is up and running",
		"MONGODB": mongoStatus,
	})
}

func CreateUser(c *gin.Context) {
	var newUser database.User
	if err := c.ShouldBindJSON(&newUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(newUser.Password), 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	newUser.Password = string(hash)
	if newUser.ID.IsZero() {
		newUser.ID = primitive.NewObjectID()
	}

	_, err = database.CreateUser(newUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User created successfully", "id": newUser.ID.Hex()})
}
func GetUser(c *gin.Context) {
	id := c.Query("id")

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": id})
		return
	}

	user, err := database.GetUserByID(objID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		return
	}

	c.JSON(http.StatusOK, user)
}
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
		"message": "token generated",
	})

}
