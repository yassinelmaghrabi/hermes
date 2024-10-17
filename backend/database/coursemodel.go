package database

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Course struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	Name        string             `bson:"name"`
	Description string             `bson:"description"`
	Hours       int                `bson:"hours"`
	Code        string             `bson:"code"`
}

func CreateCourse(course Course) (*mongo.InsertOneResult, error) {
	collection := GetCollection("courses")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	result, err := collection.InsertOne(ctx, course)
	return result, err
}

func GetCourseByID(id primitive.ObjectID) (Course, error) {
	var course Course
	collection := GetCollection("courses")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(&course)
	return course, err
}

func GetCourseByCode(code string) (Course, error) {
	var course Course
	collection := GetCollection("courses")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	err := collection.FindOne(ctx, bson.M{"code": code}).Decode(&course)
	return course, err
}

func UpdateCourse(id primitive.ObjectID, updatedData Course) (*mongo.UpdateResult, error) {
	collection := GetCollection("courses")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	update := bson.M{
		"$set": bson.M{
			"name":        updatedData.Name,
			"description": updatedData.Description,
			"hours":       updatedData.Hours,
			"code":        updatedData.Code,
		},
	}
	result, err := collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	return result, err
}

func DeleteCourse(id primitive.ObjectID) (*mongo.DeleteResult, error) {
	collection := GetCollection("courses")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	result, err := collection.DeleteOne(ctx, bson.M{"_id": id})
	return result, err
}

func GetAllCourses() ([]Course, error) {
	var courses []Course
	collection := GetCollection("courses")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	for cursor.Next(ctx) {
		var course Course
		if err := cursor.Decode(&course); err != nil {
			return nil, err
		}
		courses = append(courses, course)
	}
	if err := cursor.Err(); err != nil {
		return nil, err
	}
	return courses, nil
}
