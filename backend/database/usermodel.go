package database

import (
	"context"
	"fmt"
	"hermes/validators"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type User struct {
	ID       primitive.ObjectID `bson:"_id,omitempty"`
	Username string             `bson:"username"`
	Email    string             `bson:"email"`
	Name     string             `bson:"name"`
	Password string             `bson:"password"`
	Status   string             `bson:"status"`
	GPA      float64            `bson:"gpa"`
	Hours    int                `bson:"hours"`
}

func CreateUser(user User) (*mongo.InsertOneResult, error) {

	if !validators.IsValidEmail(user.Email) {
		return nil, fmt.Errorf("invalid Email")
	}
	if !validators.IsValidPassword(user.Password) {
		return nil, fmt.Errorf("invalid Password")
	}
	collection := GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	result, err := collection.InsertOne(ctx, user)
	if mongo.IsDuplicateKeyError(err) {
		return nil, fmt.Errorf("username/email already exists")
	}
	return result, err
}


func UpdateUser(id primitive.ObjectID, updatedData bson.M) (*mongo.UpdateResult, error) {
	collection := GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{
		 "$set": updatedData,
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	return result, err
}

func GetUserByID(id primitive.ObjectID) (User, error) {
	var user User
	collection := GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	return user, err
}
func GetUserByUsername(username string) (User, error) {
	var user User
	collection := GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	err := collection.FindOne(ctx, bson.M{"username": username}).Decode(&user)
	return user, err
}

func DeleteUserByID(id primitive.ObjectID) (*mongo.DeleteResult , error){
	collection := GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := collection.DeleteOne(ctx, bson.M{"_id": id})
	return result, err
}

func GetAllUsers()([]User, error) {
	var users []User
	collection := GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var user User
		if err := cursor.Decode(&user); err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return users, nil
}