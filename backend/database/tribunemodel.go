package database

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Tribune struct {
	ID          primitive.ObjectID   `bson:"_id,omitempty"`
	Name        string               `bson:"name"`
	Description string               `bson:"description"`
	Maintainers []primitive.ObjectID `bson:"maintainers"`
	CourseID    primitive.ObjectID   `bson:"courseID"`
	Messages    []Message            `bson:"messages"`
}
type Message interface {
	GetID() primitive.ObjectID
	GetContent() string
	GetUser() primitive.ObjectID
	GetDate() primitive.DateTime
}

type PlainText struct {
	ID      primitive.ObjectID `bson:"_id,omitempty"`
	Content string             `bson:"content"`
	User    primitive.ObjectID `bson:"user"`
	Date    primitive.DateTime `bson:"date"`
}

func (pt *PlainText) GetID() primitive.ObjectID   { return pt.ID }
func (pt *PlainText) GetContent() string          { return pt.Content }
func (pt *PlainText) GetUser() primitive.ObjectID { return pt.User }
func (pt *PlainText) GetDate() primitive.DateTime { return pt.Date }

type Assignment struct {
	ID       primitive.ObjectID `bson:"_id,omitempty"`
	Content  string             `bson:"content"`
	User     primitive.ObjectID `bson:"user"`
	Date     primitive.DateTime `bson:"date"`
	DeadLine primitive.DateTime `bson:"deadline"`
}

func PostMessage(message Message, id primitive.ObjectID) (*mongo.UpdateResult, error) {
	collection := GetCollection("tribune")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	update := bson.M{
		"$addToSet": bson.M{"messages": message},
	}
	return collection.UpdateByID(ctx, id, update)
}

func CreateTribune(tribune Tribune) (*mongo.InsertOneResult, error) {
	collection := GetCollection("tribune")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	creator, _ := GetUserByID(tribune.Maintainers[0])
	var createdmessage PlainText = PlainText{
		ID:      primitive.NewObjectID(),
		Content: "This Tribune Was Created by " + creator.Name,
		User:    creator.ID,
		Date:    primitive.NewDateTimeFromTime(time.Now()),
	}
	tribune.Messages = append(tribune.Messages, &createdmessage)
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
		"$set": updatedData,
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
			continue
		} else {
			tribunes = append(tribunes, tribune)
		}
	}

	return tribunes, nil
}
