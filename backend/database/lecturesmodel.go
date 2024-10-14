package database

import (
	"context"
	"errors"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Date struct {
	Slot int `bson:"slot"`
	Day  int `bson:"day"`
}

type Lecture struct {
	ID          primitive.ObjectID   `bson:"_id,omitempty"`
	Name        string               `bson:"name"`
	Description string               `bson:"description"`
	Code        string               `bson:"code"`
	Hours       int                  `bson:"hours"`
	Marks       int                  `bson:"Marks"`
	Grade       rune                 `bson:"grade"`
	Slots       int                  `bson:"slots"`
	SlotsTaken  int                  `bson:"slotstaken"`
	Hall        string               `bson:"hall"`
	Date        Date                 `bson:"date"`
	Users       []primitive.ObjectID `bsom:"users"`
}

func CreateLecture(lecture Lecture) (*mongo.InsertOneResult, error) {
	collection := GetCollection("lecture")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	result, err := collection.InsertOne(ctx, lecture)
	return result, err
}
func GetLectureByID(id primitive.ObjectID) (Lecture, error) {
	var lecture Lecture
	collection := GetCollection("lecture")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(&lecture)
	return lecture, err
}
func AssignLectureToUser(userid primitive.ObjectID, id primitive.ObjectID) (*mongo.UpdateResult, error) {
	lecture, err := GetLectureByID(id)
	if err != nil {
		return nil, err
	}

	collection := GetCollection("lecture")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var conflictingLecture Lecture
	err = collection.FindOne(ctx, bson.M{
		"users": userid,
		"date":  lecture.Date,
	}).Decode(&conflictingLecture)

	if err == nil {
		return nil, fmt.Errorf("time conflict: user already assigned to lecture %s on the same date", conflictingLecture.Name)
	} else if err != mongo.ErrNoDocuments {
		return nil, err
	}

	if lecture.SlotsTaken >= lecture.Slots {
		return nil, fmt.Errorf("no available slots in the lecture")
	}

	// Update the lecture document
	IncrementLectureSlotsTaken(id, 1)
	update := bson.M{
		"$addToSet": bson.M{"users": userid},
	}
	result, err := collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	if err != nil {
		return nil, err
	}

	if result.ModifiedCount == 0 {
		return nil, fmt.Errorf("failed to assign user to lecture: no document modified")
	}

	return result, nil
}
func GetLecturesByName(name string) ([]Lecture, error) {
	var lectures []Lecture
	collection := GetCollection("lecture")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{"name": name})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var lecture Lecture
		if err := cursor.Decode(&lecture); err != nil {
			return nil, err
		}
		lectures = append(lectures, lecture)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return lectures, nil
}

func UpdateLecture(id primitive.ObjectID, updatedData Lecture) (*mongo.UpdateResult, error) {
	collection := GetCollection("lecture")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"name":        updatedData.Name,
			"description": updatedData.Description,
			"code":        updatedData.Code,
			"slots":       updatedData.Slots,
			"hall":        updatedData.Hall,
		},
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	return result, err
}
func IncrementLectureSlotsTaken(id primitive.ObjectID, amount int) (*mongo.UpdateResult, error) {
	collection := GetCollection("lecture")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	oldstate, err := GetLectureByID(id)
	if err != nil {
		return nil, err
	}
	if oldstate.SlotsTaken+amount > oldstate.Slots {
		return nil, errors.New("Lecture fully occupied")
	}

	update := bson.M{
		"$set": bson.M{
			"slotstaken": oldstate.SlotsTaken + amount,
		},
	}
	result, err := collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	if result.ModifiedCount == 0 {
		return nil, fmt.Errorf("failed to assign user to lecture: no document modified")
	}

	return result, err
}

func DeleteLecture(id primitive.ObjectID) (*mongo.DeleteResult, error) {
	collection := GetCollection("lecture")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := collection.DeleteOne(ctx, bson.M{"_id": id})
	return result, err
}

func GetAllLectures() ([]Lecture, error) {
	var lectures []Lecture
	collection := GetCollection("lecture")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var lecture Lecture
		if err := cursor.Decode(&lecture); err != nil {
			return nil, err
		}
		lectures = append(lectures, lecture)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return lectures, nil
}
