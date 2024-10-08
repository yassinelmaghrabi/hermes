package database

import (
	"context"
	"fmt"
	"hermes/validators"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client

func ConnectDB() {
	// mongoHost := os.Getenv("MONGO_HOST")
	// mongoPort := os.Getenv("MONGO_PORT")
	// mongoUser := os.Getenv("MONGO_USER")
	// mongoPassword := os.Getenv("MONGO_PASSWORD")
	// mongoDatabase := os.Getenv("MONGO_DATABASE")

	// Construct the MongoDB connection URI
	// mongoURI := fmt.Sprintf("mongodb://%s:%s@%s:%s",
	// 	mongoUser, mongoPassword, mongoHost, mongoPort)
	mongoURI := "mongodb://localhost:27017"
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(mongoURI)
	var err error
	Client, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)

	}
	err = Client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)

	}
	InitIndexes()
	log.Println("Connected to MongoDB...")

}
func Ping() error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	return Client.Ping(ctx, nil)
}

func GetCollection(collectionName string) *mongo.Collection {
	return Client.Database(os.Getenv("MONGO_DATABASE")).Collection(collectionName)
}

type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	Username  string             `bson:"username"`
	Email     string             `bson:"email"`
	Name      string             `bson:"name"`
	Password  string             `bson:"password"`
	Status    string             `bson:"satus"`
	Maintains string             `bson:"maintain"`
}

func InitIndexes() {
	collection := GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	emailindexModel := mongo.IndexModel{
		Keys:    bson.M{"email": 1},
		Options: options.Index().SetUnique(true),
	}
	usernameindexModel := mongo.IndexModel{
		Keys:    bson.M{"username": 1},
		Options: options.Index().SetUnique(true),
	}

	_, err := collection.Indexes().CreateMany(ctx, []mongo.IndexModel{emailindexModel, usernameindexModel})
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Unique indexes created")
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
