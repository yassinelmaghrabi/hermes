package helpers

import (
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

var NotificationChannel = make(chan Notification)

var (
	SystemAlertsChannelID, _  = primitive.ObjectIDFromHex("64faec9bf6d7d9c54b4d7e33")
	AnnouncementsChannelID, _ = primitive.ObjectIDFromHex("64faec9bf6d7d9c54b4d7e44")
)

type Notification struct {
	ObjectID primitive.ObjectID `json:"object_id"`
	Message  string             `json:"message"`
	Author   string             `json:"author"`
	Time     time.Time          `json:"time"`
}

func SendNotification(objectID primitive.ObjectID, author string, format string, args ...interface{}) {
	message := fmt.Sprintf(format, args...)
	if author == "" {
		author = "System"
	}

	notification := Notification{
		ObjectID: objectID,
		Message:  message,
		Author:   author,
		Time:     time.Now(),
	}
	NotificationChannel <- notification
}
