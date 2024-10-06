package database

import (
	"context"
	"fmt"
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
	mongoHost := os.Getenv("MONGO_HOST")
	mongoPort := os.Getenv("MONGO_PORT")
	// mongoUser := os.Getenv("MONGO_USER")
	// mongoPassword := os.Getenv("MONGO_PASSWORD")
	mongoDatabase := os.Getenv("MONGO_DATABASE")

	// Construct the MongoDB connection URI
	mongoURI := fmt.Sprintf("mongodb://%s:%s/%s",
		mongoHost, mongoPort, mongoDatabase)
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
	Name      string             `bson:"name"`
	Email     string             `bson:"email"`
	Password  string             `bson:"password"`
	Status    string             `bson:"satus"`
	Maintains string             `bson:"maintain"`
}

func CreateUser(user User) (*mongo.InsertOneResult, error) {
	collection := GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return collection.InsertOne(ctx, user)
}
func GetUser(id string) (User, error) {
	var user User
	collection := GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	return user, err
}
