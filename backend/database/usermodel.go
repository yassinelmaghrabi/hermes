package database

import (
	"bytes"
	"context"
	"fmt"
	"hermes/validators"
	"image"
	"image/jpeg"
	"mime/multipart"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

type ProfilePic struct {
	ID       primitive.ObjectID `bson:"_id,omitempty"`
	Filename string             `bson:"filename"`
	Data     []byte             `bson:"data"`
}
type User struct {
	ID                   primitive.ObjectID `bson:"_id,omitempty"`
	Username             string             `bson:"username"`
	Email                string             `bson:"email"`
	Name                 string             `bson:"name"`
	Password             string             `bson:"password"`
	Status               string             `bson:"status"`
	GPA                  float64            `bson:"gpa"`
	Hours                int                `bson:"hours"`
	ProfilePic           ProfilePic         `bson:"profilepic"`
	PasswordResetToken   string             `bson:"passwordResetToken"`
	PasswordResetExpires time.Time          `bson:"passwordResetExpires"`
}

func CreateUser(user User) (*mongo.InsertOneResult, error) {

	if !validators.IsValidEmail(user.Email) {
		return nil, fmt.Errorf("invalid Email")
	}
	if !validators.IsValidPassword(user.Password) {
		return nil, fmt.Errorf("invalid Password")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), 10)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password")
	}
	user.Password = string(hash)

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
func GetUserData(id primitive.ObjectID) (User, error) {
	var user User
	collection := GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	projection := bson.M{"profilepic": 0}
	err := collection.FindOne(ctx, bson.M{"_id": id}, options.FindOne().SetProjection(projection)).Decode(&user)
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

func DeleteUserByID(id primitive.ObjectID) (*mongo.DeleteResult, error) {
	collection := GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := collection.DeleteOne(ctx, bson.M{"_id": id})
	return result, err
}

func GetAllUsers() ([]User, error) {
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
			continue
		} else {
			users = append(users, user)
		}
	}

	return users, nil
}
func AddProfilePicture(file *multipart.FileHeader, id primitive.ObjectID) (*mongo.UpdateResult, error) {
	src, err := file.Open()
	if err != nil {
		return nil, err
	}
	defer src.Close()
	if file.Size > 12*1024*1024 {
		return nil, fmt.Errorf("file too big")
	}
	data := make([]byte, file.Size)
	_, err = src.Read(data)
	if err != nil {
		return nil, fmt.Errorf("failed to read file")
	}
	img, _, err := image.Decode(bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %v", err)
	}
	var buf bytes.Buffer
	err = jpeg.Encode(&buf, img, &jpeg.Options{Quality: 25})
	if err != nil {
		return nil, fmt.Errorf("failed to compress image: %v", err)
	}

	photo := ProfilePic{
		Filename: file.Filename,
		Data:     buf.Bytes(),
	}
	collection := GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"profilepic": photo,
		},
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	return result, err
}
func GetProfilePicture(id primitive.ObjectID) ([]byte, error) {
	var photo ProfilePic
	var user User
	collection := GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	photo = user.ProfilePic
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("photo not found")
		} else {
			return nil, err
		}
	}
	return photo.Data, nil

}

func GetUserByUsernameOrEmail(username, email string) (*User, error) {
	collection := GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user User
	filter := bson.M{}

	if username != "" && email != "" {
		filter["$or"] = []bson.M{
			{"username": username},
			{"email": email},
		}
	} else if username != "" {
		filter["username"] = username
	} else if email != "" {
		filter["email"] = email
	} else {
		return nil, fmt.Errorf("Both Email and Username cannot be empty")
	}

	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}

	return &user, nil
}

func GetUserByPasswordResetToken(token string) (User, error) {
	var user User
	collection := GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	filter := bson.M{
		"passwordResetToken":   token,
		"passwordResetExpires": bson.M{"$gt": time.Now()},
	}
	err := collection.FindOne(ctx, filter).Decode(&user)
	return user, err

}

func ChangePassword(id primitive.ObjectID, newPassword string) (*mongo.UpdateResult, error) {
	if !validators.IsValidPassword(newPassword) {
		return nil, fmt.Errorf("invalid Password")
	}

	collection := GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	hashPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), 10)
	if err != nil {
		return nil, fmt.Errorf("invalid Password Hash")
	}

	updatedData := bson.M{
		"password": string(hashPassword),
	}

	updated := bson.M{
		"$set": updatedData,
	}
	result, err := collection.UpdateOne(ctx, bson.M{"_id": id}, updated)
	return result, err
}
