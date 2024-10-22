package controllers

import (
	"hermes/database"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func CreateLecture(c *gin.Context) {
	var lecture database.Lecture

	if err := c.ShouldBindJSON(&lecture); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if lecture.ID.IsZero() {
		lecture.ID = primitive.NewObjectID()
	}

	_, err := database.CreateLecture(lecture)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Lecture"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Lecture created successfully", "id": lecture.ID.Hex()})
}

// TODO: not completed
func CreateLectureWithTribune(c *gin.Context) {

	type Req struct {
		LectureData database.Lecture `json:"lecture" binding:"required"`
		TribuneData database.Tribune `json:"tribune" binding:"required"`
	}

	var request Req

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if request.LectureData.ID.IsZero() {
		request.LectureData.ID = primitive.NewObjectID()
	}
	if request.TribuneData.ID.IsZero() {
		request.TribuneData.ID = primitive.NewObjectID()
	}

	lecId, lecErr := database.CreateLecture(request.LectureData)

	if lecErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Lecture"})
		return
	}

	tribId, tribErr := database.CreateTribune(request.TribuneData)

	if tribErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Tribune"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Lecture created successfully", "lectureId": lecId.InsertedID, "tribuneId": tribId.InsertedID})
}

func GetLecture(c *gin.Context) {
	id := c.Query("id")
	name := c.Query("name")

	if id != "" {
		objID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
			return
		}

		lecture, err := database.GetLectureByID(objID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve lecture by ID"})
			return
		}

		c.JSON(http.StatusOK, lecture)
		return
	}

	if name != "" {
		lecture, err := database.GetLecturesByName(name)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve lecture by name"})
			return
		}

		c.JSON(http.StatusOK, lecture)
		return
	}

	c.JSON(http.StatusBadRequest, gin.H{"error": "Either 'id' or 'name' must be provided"})
}

// added update lecture
func UpdateLecture(c *gin.Context) {
	id := c.Query("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID Of lecture"})
		return
	}

	var UpdateLecture database.Lecture
	if err := c.ShouldBindJSON(&UpdateLecture); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := database.UpdateLecture(objID, UpdateLecture)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update lecture"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Lecture updated successfully", "resultMatchedCount": result.MatchedCount})

}

func GetAllLectures(c *gin.Context) {
	lectures, err := database.GetAllLectures()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Unable to fetch lectures",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"lectures": lectures,
	})
}
func DeleteLecture(c *gin.Context) {
	id := c.Query("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": id})
		return
	}
	_, err = database.DeleteLecture(objID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete lecture"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": id + " Deleted"})

}
func EnrollUserInLecture(c *gin.Context) {
	userID := c.Query("user_id")
	if userID == "" {
		if val, ok := c.Get("user"); ok {
			userID = val.(database.User).ID.Hex()
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "????"})
			return
		}
	}
	lectureID := c.Query("lecture_id")

	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	lectureObjID, err := primitive.ObjectIDFromHex(lectureID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid lecture ID"})
		return
	}

	result, err := database.AssignLectureToUser(userObjID, lectureObjID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User enrolled successfully", "modified_count": result.ModifiedCount})
}
