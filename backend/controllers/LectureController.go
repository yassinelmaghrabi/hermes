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
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": id})
		return
	}

	lecture, err := database.GetLectureByID(objID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve lecture"})
		return
	}

	c.JSON(http.StatusOK, lecture)
}

//add update lecture

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
