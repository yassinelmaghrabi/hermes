package database

import "go.mongodb.org/mongo-driver/bson/primitive"

type Course struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	Name        string             `bson:"name"`
	Description string             `bson:"description"`
	Hours       int                `bson:"hours"`
	Code        string             `bson:"code"`
}
