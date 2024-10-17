package controllers

import (
	"hermes/database"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func CreateSection(c *gin.Context) {
	var section database.Section
	if err := c.ShouldBindJSON(&section); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if section.ID.IsZero() {
		section.ID = primitive.NewObjectID()
	}

	_, err := database.CreateSection(section)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Section"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Section created successfully", "id": section.ID.Hex()})
}

func GetSection(c *gin.Context) {
	id := c.Query("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	section, err := database.GetSectionByID(objID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve section"})
		return
	}

	c.JSON(http.StatusOK, section)
}

func UpdateSection(c *gin.Context) {
	id := c.Query("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var updatedSection database.Section
	if err := c.ShouldBindJSON(&updatedSection); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := database.UpdateSection(objID, updatedSection)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update Section"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Section updated successfully", "modified_count": result.ModifiedCount})
}

func GetAllSections(c *gin.Context) {
	sections, err := database.GetAllSections()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Unable to fetch sections",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"sections": sections,
	})
}

func DeleteSection(c *gin.Context) {
	id := c.Query("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	result, err := database.DeleteSection(objID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete section"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Section deleted", "deleted_count": result.DeletedCount})
}

func EnrollUser(c *gin.Context) {
	userID := c.Query("user_id")
	sectionID := c.Query("section_id")

	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	sectionObjID, err := primitive.ObjectIDFromHex(sectionID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid section ID"})
		return
	}

	result, err := database.EnrollUserInSection(userObjID, sectionObjID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User enrolled successfully", "modified_count": result.ModifiedCount})
}
