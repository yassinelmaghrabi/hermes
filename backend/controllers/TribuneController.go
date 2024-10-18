package controllers

import (
	"hermes/database"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func CreateTribune(c *gin.Context) {
	var user database.User
	if val, ok := c.Get("user"); ok {
		user = val.(database.User)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "????"})
	}

	var newTribune database.Tribune
	if err := c.ShouldBindJSON(&newTribune); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if newTribune.ID.IsZero() {
		newTribune.ID = primitive.NewObjectID()
	}
	newTribune.Maintainers = append(newTribune.Maintainers, user.ID)
	_, err := database.CreateTribune(newTribune)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Tribune"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tribune created successfully", "id": newTribune.ID.Hex()})
}
func GetTribune(c *gin.Context) {
	id := c.Query("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": id})
		return
	}

	tribune, err := database.GetTribuneByID(objID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve tribune"})
		return
	}

	c.JSON(http.StatusOK, tribune)
}

func UpdateTribune(c *gin.Context) {
	id := c.Query("id")
	var user database.User
	if val, ok := c.Get("user"); ok {
		user = val.(database.User)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "????"})
	}

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": id})
		return
	}
	var newTribune database.Tribune
	var oldTribune database.Tribune
	if err := c.ShouldBindJSON(&newTribune); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	oldTribune, err = database.GetTribuneByID(objID)
	validuser := false
	for _, users := range oldTribune.Maintainers {
		if users == user.ID {
			validuser = true
		}
	}
	if !validuser {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "you do not maintain this tribune",
		})
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve old tribune"})
		return
	}

	if newTribune.Name == "" {
		newTribune.Name = oldTribune.Name
	}
	if newTribune.Description == "" {
		newTribune.Description = oldTribune.Description
	}
	if len(newTribune.Maintainers) == 0 {
		newTribune.Maintainers = oldTribune.Maintainers
	}

	_, err = database.UpdateTribune(objID, newTribune)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update Tribune"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tribune updated successfully", "id": oldTribune.ID.Hex()})
}

func GetAllTribunes(c *gin.Context) {
	tribunes, err := database.GetAllTribunes()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Unable to fetch tribunes",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"tribunes": tribunes,
	})
}
