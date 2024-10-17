package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client

func ConnectDB() {
	var mongoURI string
	if os.Getenv("DOCKER") == "True" {
		mongoHost := os.Getenv("MONGO_HOST")
		mongoPort := os.Getenv("MONGO_PORT")
		mongoUser := os.Getenv("MONGO_USER")
		mongoPassword := os.Getenv("MONGO_PASSWORD")

		mongoURI = fmt.Sprintf("mongodb://%s:%s@%s:%s",
			mongoUser, mongoPassword, mongoHost, mongoPort)
	} else {
		mongoURI = os.Getenv("MONGO_URI")
	}
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
func InitIndexes() {
	usercollection := GetCollection("users")
	tribunecollection := GetCollection("tribune")
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
	tribunenameindexModel := mongo.IndexModel{
		Keys:    bson.M{"name": 1},
		Options: options.Index().SetUnique(true),
	}

	_, err := usercollection.Indexes().CreateMany(ctx, []mongo.IndexModel{emailindexModel, usernameindexModel})
	if err != nil {
		log.Fatal(err)
	}
	_, err = tribunecollection.Indexes().CreateOne(ctx, tribunenameindexModel)
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Unique indexes created")
}

func Ping() error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	return Client.Ping(ctx, nil)
}

func GetCollection(collectionName string) *mongo.Collection {
	return Client.Database(os.Getenv("MONGO_DATABASE")).Collection(collectionName)
}
