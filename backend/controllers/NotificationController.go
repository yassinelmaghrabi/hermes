package controllers

import (
	"encoding/json"
	"hermes/database"
	"hermes/helpers"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func SSENotificationEndpoint(c *gin.Context) {
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")

	var userID primitive.ObjectID
	if val, ok := c.Get("user"); ok {
		userID = val.(database.User).ID
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	subs, _ := database.GetUserNotificationSubs(userID)

	for notification := range helpers.NotificationChannel {
		if contains(subs, notification.ObjectID) {
			jsonData, err := json.Marshal(notification)
			if err != nil {
				continue
			}
			c.SSEvent("message", string(jsonData))
		}
	}
}

func contains(slice []primitive.ObjectID, item primitive.ObjectID) bool {
	for _, a := range slice {
		if a == item {
			return true
		}
	}
	return false
}
