package controllers

import (
	"hermes/database"
	"net/http"
	"context"
	"time"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func AddTask(c *gin.Context) {
	var newTask database.Task

	if err := c.ShouldBindJSON(&newTask); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newTask.ID = primitive.NewObjectID()

	result, err := database.CreateTask(newTask)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create task"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Task created successfully",
		"task_id": result.InsertedID,
	})
}

func DeleteTask(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task ID"})
		return
	}

	collection := database.GetCollection("task")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete task"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Task deleted successfully"})
}

func UpdateTask(c *gin.Context) {
	id := c.Query("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		 c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		 return
	}

	var updatedData map[string]interface{}
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		 c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		 return
	}

	result, err := database.UpdateTask(objID, updatedData)
	if err != nil {
		 c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update task"})
		 return
	}

	if result.ModifiedCount == 0 {
		 c.JSON(http.StatusNotFound, gin.H{"error": "No task found to update"})
		 return
	}

	c.JSON(http.StatusOK, gin.H{
		 "message": "Task updated successfully",
		 "task_id": id,
	})
}

func GetTask(c *gin.Context) {
	id := c.Query("id")

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": id})
		return
	}

	task, err := database.GetTask(objID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve Task"})
		return
	}

	c.JSON(http.StatusOK, task)
}