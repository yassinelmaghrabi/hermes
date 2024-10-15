package database

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Task struct {
	ID     primitive.ObjectID `bson:"_id,omitempty "`
	Title  string             `bson:"title"`
	IsDone bool               `bson:"is_done"`
	User   primitive.ObjectID `bson:"userid"`
}

func CreateTask(task Task) (*mongo.InsertOneResult, error) {
	collection := GetCollection("task")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	result, err := collection.InsertOne(ctx, task)
	return result, err
}

func DeleteTask(id primitive.ObjectID) (*mongo.DeleteResult, error) {
	collection := GetCollection("task")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := collection.DeleteOne(ctx, bson.M{"_id": id})
	return result, err
}

func UpdateTask(id primitive.ObjectID, updatedTask bson.M) (*mongo.UpdateResult, error) {
	collection := GetCollection("task")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{
		"$set": updatedTask,
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	return result, err
}

func GetTask(id primitive.ObjectID, userid primitive.ObjectID) (Task, error) {
	var task Task
	collection := GetCollection("task")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := collection.FindOne(ctx, bson.M{"_id": id,"userid":userid}).Decode(&task)
	return task, err
}
