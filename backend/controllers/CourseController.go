package controllers

import (
	"hermes/database"
	"net/http"
	"go.mongodb.org/mongo-driver/mongo"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func CreateCourse(c *gin.Context) {
	var course database.Course
	if err := c.ShouldBindJSON(&course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if course.ID.IsZero() {
		course.ID = primitive.NewObjectID()
	}

	result, err := database.CreateCourse(course)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) { // Check if it's a duplicate key error
		c.JSON(http.StatusConflict, gin.H{"error": "Course with this name already exists"})
		return
  }
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Course"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Course created successfully", "id": result.InsertedID})
}

func GetCourse(c *gin.Context) {
	id := c.Query("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	course, err := database.GetCourseByID(objID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve course"})
		return
	}

	c.JSON(http.StatusOK, course)
}

func GetCourseByCode(c *gin.Context) {
	code := c.Query("code")
	course, err := database.GetCourseByCode(code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve course"})
		return
	}

	c.JSON(http.StatusOK, course)
}

func UpdateCourse(c *gin.Context) {
	id := c.Query("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var updatedCourse database.Course
	if err := c.ShouldBindJSON(&updatedCourse); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := database.UpdateCourse(objID, updatedCourse)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update Course"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Course updated successfully", "modified_count": result.ModifiedCount})
}

func DeleteCourse(c *gin.Context) {
	id := c.Query("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	result, err := database.DeleteCourse(objID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete course"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Course deleted successfully", "deleted_count": result.DeletedCount})
}

func GetAllCourses(c *gin.Context) {
	courses, err := database.GetAllCourses()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve courses"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"courses": courses})
}
