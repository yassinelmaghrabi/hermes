package controllers

import (
	"hermes/database"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user", "message": err.Error()})
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
	database.UpdateGPA(objID)
	user, err := database.GetUserByID(objID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		return
	}

	c.JSON(http.StatusOK, user)
}
func UserData(c *gin.Context) {
	var objID primitive.ObjectID
	if val, ok := c.Get("user"); ok {
		objID = val.(database.User).ID
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "????"})
	}
	database.UpdateGPA(objID)
	user, err := database.GetUserByID(objID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func UpdateUser(c *gin.Context) {
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

	updateBSON := bson.M{}
	for key, value := range updateData {
		updateBSON[key] = value
	}

	_, err = database.UpdateUser(objID, updateBSON)
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
		"users": users,
	})
}

func DeleteUsers(c *gin.Context) {
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
func GetProfilePicture(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Query("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid photo ID"})
		return
	}
	photo, err := database.GetProfilePicture(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
		return
	}
	c.Data(http.StatusOK, "image/jpeg", photo)
}

func AddProfilePicture(c *gin.Context) {
	var user database.User
	if val, ok := c.Get("user"); ok {
		user = val.(database.User)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "????"})
	}
	file, err := c.FormFile("photo")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	_, err = database.AddProfilePicture(file, user.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User photo uploaded succesfully"})
}

func ChangeUserPassword(c *gin.Context) {

	var ID primitive.ObjectID

	val, ok := c.Get("userID")

	if ok == false {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unable to change password"})
		return
	} else {
		ID = val.(primitive.ObjectID)
	}

	var bodyData struct {
		NewPassword string `json:"newPassword" binding:"required"`
	}

	if err := c.ShouldBindJSON(&bodyData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid password format"})
		return
	}

	_, err := database.ChangePassword(ID, bodyData.NewPassword)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}

func GetEnrolled(c *gin.Context) {
	var user database.User
	if val, ok := c.Get("user"); ok {
		user = val.(database.User)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "????"})
	}
	sections, lectures, err := database.GetAssignedSectionsAndLectures(user.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"sections": sections,
		"lectures": lectures,
	})

}

func UpdateGPA(c *gin.Context) {
	var user database.User
	if val, ok := c.Get("user"); ok {
		user = val.(database.User)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "????"})
	}
	_, err := database.UpdateGPA(user.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "GPA updated"})

}
