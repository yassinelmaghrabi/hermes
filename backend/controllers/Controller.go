package controllers

import (
	"hermes/database"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
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

	if newUser.ID.IsZero() {
		newUser.ID = primitive.NewObjectID()
	}

	_, err := database.CreateUser(newUser)
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

	user, err := database.GetUser(objID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		return
	}

	c.JSON(http.StatusOK, user)
}
