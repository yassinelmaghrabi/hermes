package controllers

import (
	"hermes/database"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
	"go.mongodb.org/mongo-driver/bson"

)

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




func UpdateUser(c *gin.Context) {
	// Add admin authorization here

	id := c.Query("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		 c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		 return
	}

	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		 c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		 return
	}

	// Convert updateData to bson.M
	updateBSON := bson.M{}
	for key, value := range updateData {
		 updateBSON[key] = value
	}

	_ , err = database.UpdateUser(objID, updateBSON)
	if err != nil {
		 c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update User"})
		 return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully", "id": id})
}


func GetAllUsers(c *gin.Context) {
	users, err := database.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Unable to fetch users",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"uesrs": users,
	})
}

func DeleteUsers(c *gin.Context){
	id := c.Query("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}
	
	result, err := database.DeleteUserByID(objID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}
	
	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}


