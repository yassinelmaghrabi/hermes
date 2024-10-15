package database

type Course struct {
	Name        string `bson:"name"`
	Description string `bson:"description"`
	Grade       int    `bson:"Grade"`
}
