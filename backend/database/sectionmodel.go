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

type Section struct {
	ID          primitive.ObjectID   `bson:"_id,omitempty"`
	Name        string               `bson:"name"`
	Description string               `bson:"description"`
	Code        string               `bson:"code"`
	Capacity    int                  `bson:"capacity"`
	Enrolled    int                  `bson:"enrolled"`
	Room        string               `bson:"room"`
	Date        Date                 `bson:"date"`
	Users       []primitive.ObjectID `bson:"users"`
	Course      primitive.ObjectID   `bson:"course"`
}

func CreateSection(section Section) (*mongo.InsertOneResult, error) {
	collection := GetCollection("section")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	result, err := collection.InsertOne(ctx, section)
	return result, err
}

func GetSectionByID(id primitive.ObjectID) (Section, error) {
	var section Section
	collection := GetCollection("section")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(&section)
	return section, err
}
func ReEnrollUserSection(userID primitive.ObjectID, sectionID primitive.ObjectID) (*mongo.UpdateResult, error) {
	collection := GetCollection("section")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	var section Section
	err := collection.FindOne(ctx, bson.M{
		"_id": sectionID,
	}).Decode(&section)
	if err != nil {
		return nil, err
	}

	update := bson.M{
		"$pull": bson.M{"users": userID},
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": section.ID}, update)
	if err != nil {
		return nil, err
	}

	if result.ModifiedCount == 0 {
		return nil, fmt.Errorf("failed to remove user from section: no document modified")
	}
	return EnrollUserInSection(userID, section.Course)
}
func EnrollUserInSection(userID primitive.ObjectID, courseID primitive.ObjectID) (*mongo.UpdateResult, error) {
	sections, err := GetAllSectionsForCourse(courseID)
	if err != nil {
		return nil, err
	}
	if len(sections) == 0 {
		return nil, fmt.Errorf("no sections available for the course")
	}
	var leastEnrolledSection Section
	leastEnrolledSection = sections[0]
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	lecturecollection := GetCollection("lecture")
	var availablesections []Section
	for _, availablesection := range sections {
		var conflictingLecture Lecture
		err = lecturecollection.FindOne(ctx, bson.M{
			"users": userID,
			"date":  availablesection.Date,
		}).Decode(&conflictingLecture)
		if err == mongo.ErrNoDocuments {
			availablesections = append(availablesections, availablesection)
		}
	}
	if len(availablesections) == 0 {
		return nil, fmt.Errorf("no available sections")
	}
	for _, availablesection := range availablesections {
		if availablesection.Enrolled < leastEnrolledSection.Enrolled {
			leastEnrolledSection = availablesection
		}
	}
	section := leastEnrolledSection
	sectionID := leastEnrolledSection.ID
	collection := GetCollection("section")

	var conflictingSection Section
	err = collection.FindOne(ctx, bson.M{
		"users": userID,
		"date":  section.Date,
	}).Decode(&conflictingSection)

	if err == mongo.ErrNoDocuments {
		return nil, fmt.Errorf("time conflict: user already enrolled in section %s on the same date", conflictingSection.Name)
	}
	if section.Enrolled >= section.Capacity {
		return nil, fmt.Errorf("no available capacity in the section")
	}

	// Update the section document
	IncrementSectionEnrolled(sectionID, 1)
	update := bson.M{
		"$addToSet": bson.M{"users": userID},
	}
	result, err := collection.UpdateOne(ctx, bson.M{"_id": sectionID}, update)
	if err != nil {
		return nil, err
	}

	if result.ModifiedCount == 0 {
		return nil, fmt.Errorf("failed to enroll user in section: no document modified")
	}

	return result, nil
}

func GetSectionsByName(name string) ([]Section, error) {
	var sections []Section
	collection := GetCollection("section")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{"name": name})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var section Section
		if err := cursor.Decode(&section); err != nil {
			return nil, err
		}
		sections = append(sections, section)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return sections, nil
}

func UpdateSection(id primitive.ObjectID, updatedData Section) (*mongo.UpdateResult, error) {
	collection := GetCollection("section")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"name":        updatedData.Name,
			"description": updatedData.Description,
			"code":        updatedData.Code,
			"capacity":    updatedData.Capacity,
			"room":        updatedData.Room,
		},
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	return result, err
}

func IncrementSectionEnrolled(id primitive.ObjectID, amount int) (*mongo.UpdateResult, error) {
	collection := GetCollection("section")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	oldState, err := GetSectionByID(id)
	if err != nil {
		return nil, err
	}
	if oldState.Enrolled+amount > oldState.Capacity {
		return nil, errors.New("Section fully occupied")
	}

	update := bson.M{
		"$set": bson.M{
			"enrolled": oldState.Enrolled + amount,
		},
	}
	result, err := collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	if result.ModifiedCount == 0 {
		return nil, fmt.Errorf("failed to update section enrollment: no document modified")
	}

	return result, err
}

func DeleteSection(id primitive.ObjectID) (*mongo.DeleteResult, error) {
	collection := GetCollection("section")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := collection.DeleteOne(ctx, bson.M{"_id": id})
	return result, err
}

func GetAllSections() ([]Section, error) {
	var sections []Section
	collection := GetCollection("section")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var section Section
		if err := cursor.Decode(&section); err != nil {
			continue
		} else {
			sections = append(sections, section)
		}
	}

	return sections, nil
}
func GetAllSectionsForCourse(courseid primitive.ObjectID) ([]Section, error) {
	var sections []Section
	collection := GetCollection("section")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{"course": courseid})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var section Section
		if err := cursor.Decode(&section); err != nil {
			continue
		} else {
			sections = append(sections, section)
		}
	}

	return sections, nil
}
