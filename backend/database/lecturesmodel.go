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
	Capacity    int                  `bson:"capacity"`
	Enrolled    int                  `bson:"enrolled"`
	Hall        string               `bson:"hall"`
	Date        Date                 `bson:"date"`
	Users       []primitive.ObjectID `bson:"users"`
	Course      primitive.ObjectID   `bson:"course"`
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

	if err != mongo.ErrNoDocuments {
		return nil, fmt.Errorf("time conflict: user already assigned to lecture %s on the same date", conflictingLecture.Name)
	}

	if lecture.Enrolled >= lecture.Capacity {
		return nil, fmt.Errorf("no available slots in the lecture")
	}
	var conflictingSection Section
	sectioncollection := GetCollection("section")
	err = sectioncollection.FindOne(ctx, bson.M{
		"users": userid,
		"date":  lecture.Date,
	}).Decode(&conflictingSection)
	if err != mongo.ErrNoDocuments {
		ReEnrollUserSection(userid, conflictingSection.ID)
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
	EnrollUserInSection(userid, lecture.Course)

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
			"capacity":    updatedData.Capacity,
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
	if oldstate.Enrolled+amount > oldstate.Capacity {
		return nil, errors.New("Lecture fully occupied")
	}

	update := bson.M{
		"$set": bson.M{
			"slotstaken": oldstate.Enrolled + amount,
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
			continue
		} else {
			lectures = append(lectures, lecture)
		}
	}

	return lectures, nil
}
func GetAllLecturesForUser(userid primitive.ObjectID) ([]Lecture, error) {
	var lectures []Lecture
	collection := GetCollection("lecture")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{"users": userid})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var lecture Lecture
		if err := cursor.Decode(&lecture); err != nil {
			continue
		} else {
			lectures = append(lectures, lecture)
		}
	}

	return lectures, nil
}
