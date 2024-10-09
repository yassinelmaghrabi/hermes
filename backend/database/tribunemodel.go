package database

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Tribune struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	Name        string             `bson:"name"`
	Description string             `bson:"description"`
	Maintainers []string           `bson:"maintainers"`
}

type Message struct {
	ID      primitive.ObjectID `bson:"_id,omitempty"`
	Type    string             `bson:"type"`
	Content string             `bson:"content"`
	User    string             `bson:"user"`
	Status  string             `bson:"status"`
}

func CreateTribune(tribune Tribune) (*mongo.InsertOneResult, error) {
	collection := GetCollection("tribune")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	result, err := collection.InsertOne(ctx, tribune)
	return result, err
}

func GetTribuneByID(id primitive.ObjectID) (Tribune, error) {
	var tribune Tribune
	collection := GetCollection("tribune")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(&tribune)
	return tribune, err
}
func GetTribuneByName(name string) (Tribune, error) {
	var tribune Tribune
	collection := GetCollection("tribune")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	err := collection.FindOne(ctx, bson.M{"name": name}).Decode(&tribune)
	return tribune, err
}

func UpdateTribune(id primitive.ObjectID, updatedData Tribune) (*mongo.UpdateResult, error) {
	collection := GetCollection("tribune")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"name":        updatedData.Name,
			"description": updatedData.Description,
			"maintainers": updatedData.Maintainers,
		},
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	return result, err
}

func DeleteTribune(id primitive.ObjectID) (*mongo.DeleteResult, error) {
	collection := GetCollection("tribune")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := collection.DeleteOne(ctx, bson.M{"_id": id})
	return result, err
}

func GetAllTribunes() ([]Tribune, error) {
	var tribunes []Tribune
	collection := GetCollection("tribune")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var tribune Tribune
		if err := cursor.Decode(&tribune); err != nil {
			return nil, err
		}
		tribunes = append(tribunes, tribune)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return tribunes, nil
}
