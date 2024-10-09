package controllers

import (
	"hermes/database"
	"net/http"

	"github.com/gin-gonic/gin"
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
