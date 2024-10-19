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
type GradedCourse struct {
	Course Course `bson:"courses"`
	Grade  int    `bson:"total"`
}
type User struct {
	ID                   primitive.ObjectID `bson:"_id,omitempty"`
	Privilege            int                `bson:"Privilege"`
	Username             string             `bson:"username"`
	Email                string             `bson:"email"`
	Name                 string             `bson:"name"`
	Password             string             `bson:"password"`
	Status               string             `bson:"status"`
	GPA                  float64            `bson:"gpa"`
	TotalCreditHours     float64            `bson:"totalCreditHours"`
	Hours                int                `bson:"hours"`
	ProfilePic           ProfilePic         `bson:"profilepic"`
	PasswordResetToken   string             `bson:"passwordResetToken"`
	PasswordResetExpires time.Time          `bson:"passwordResetExpires"`
	EnrolledCourses      []Course           `bson:"enrolledCourses"`
	GradedCourses        []GradedCourse     `bson:"gradedCourses"`
	Role                 string             `bson:"role" default:"student"`
}

type Roles struct {
	Admin     string
	Moderator string
	Staff     string
	Student   string
}

var UserRole = Roles{
	Admin:     "admin",
	Moderator: "moderator",
	Staff:     "staff",
	Student:   "student",
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
	// UpdateGPA(id)
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
func GetAssignedSectionsAndLectures(id primitive.ObjectID) ([]Section, []Lecture, error) {
	sectionCollection := GetCollection("section")
	lectureCollection := GetCollection("lecture")
	var sections []Section
	var lectures []Lecture
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	sectionFilter := bson.M{"users": id}
	cursor, err := sectionCollection.Find(ctx, sectionFilter)
	if err != nil {
		return nil, nil, err
	}
	if err = cursor.All(context.TODO(), &sections); err != nil {
		return nil, nil, err
	}

	lectureFilter := bson.M{"users": id}
	cursor, err = lectureCollection.Find(ctx, lectureFilter)
	if err != nil {
		return nil, nil, err
	}
	if err = cursor.All(context.TODO(), &lectures); err != nil {
		return nil, nil, err
	}

	return sections, lectures, nil

}
func UpdateGPA(id primitive.ObjectID) (*mongo.UpdateResult, error) {
	user, err := GetUserByID(id)
	if err != nil {
		return nil, err
	}

	GradedCourses := user.GradedCourses
	var totalQualityPoints float64
	var totalCreditHours float64

	for _, course := range GradedCourses {
		var gradePoint float64
		switch {
		case course.Grade >= 93:
			gradePoint = 4.0 // A
		case course.Grade >= 90:
			gradePoint = 3.666666 // A-
		case course.Grade >= 87:
			gradePoint = 3.333333 // B+
		case course.Grade >= 83:
			gradePoint = 3.0 // B
		case course.Grade >= 80:
			gradePoint = 2.666666 // B-
		case course.Grade >= 77:
			gradePoint = 2.333333 // C+
		case course.Grade >= 73:
			gradePoint = 2.0 // C
		case course.Grade >= 70:
			gradePoint = 1.666666 // C-
		case course.Grade >= 67:
			gradePoint = 1.333333 // D+
		case course.Grade >= 63:
			gradePoint = 1.0 // D
		case course.Grade >= 60:
			gradePoint = 0.666666 // D-
		default:
			gradePoint = 0.0 // F
		}

		totalQualityPoints += gradePoint * float64(course.Course.Hours)
		totalCreditHours += float64(course.Course.Hours)
	}
	gpa := float64(0)
	if totalCreditHours != 0 {
		gpa = totalQualityPoints / totalCreditHours

	}

	filter := bson.M{"_id": id}
	update := bson.M{"$set": bson.M{"gpa": gpa, "totalCreditHours": totalCreditHours}}
	collection := GetCollection("users")

	return collection.UpdateOne(context.Background(), filter, update)
}
func GradeCourse(userID primitive.ObjectID, courseID primitive.ObjectID, grade int) (*mongo.UpdateResult, error) {
	user, err := GetUserByID(userID)
	if err != nil {
		return nil, fmt.Errorf("error retrieving user: %v", err)
	}

	var courseToGrade Course
	var enrolledIndex int
	for i, course := range user.EnrolledCourses {
		if course.ID == courseID {
			courseToGrade = course
			enrolledIndex = i
			break
		}
	}

	if courseToGrade.ID != courseID {
		return nil, fmt.Errorf("course not found in enrolled courses")
	}

	user.EnrolledCourses = append(user.EnrolledCourses[:enrolledIndex], user.EnrolledCourses[enrolledIndex+1:]...)

	gradedCourse := GradedCourse{
		Course: courseToGrade,
		Grade:  grade,
	}

	user.GradedCourses = append(user.GradedCourses, gradedCourse)

	user.TotalCreditHours += float64(courseToGrade.Hours)

	filter := bson.M{"_id": userID}
	update := bson.M{
		"$set": bson.M{
			"enrolledCourses":  user.EnrolledCourses,
			"gradedCourses":    user.GradedCourses,
			"totalCreditHours": user.TotalCreditHours,
		},
	}
	collection := GetCollection("users")

	return collection.UpdateOne(context.Background(), filter, update)
}
func AddMultipleGradedCourses(userID primitive.ObjectID, gradedCourses []GradedCourse) (*mongo.UpdateResult, error) {
	user, err := GetUserByID(userID)
	if err != nil {
		return nil, fmt.Errorf("error retrieving user: %v", err)
	}

	enrolledCoursesMap := make(map[primitive.ObjectID]bool)
	for _, course := range user.EnrolledCourses {
		enrolledCoursesMap[course.ID] = true
	}

	var coursesToRemove []primitive.ObjectID
	var newGradedCourses []GradedCourse
	var additionalCreditHours float64

	for _, gradedCourse := range gradedCourses {
		if enrolledCoursesMap[gradedCourse.Course.ID] {
			coursesToRemove = append(coursesToRemove, gradedCourse.Course.ID)
		}

		newGradedCourses = append(newGradedCourses, gradedCourse)

		additionalCreditHours += float64(gradedCourse.Course.Hours)
	}

	newEnrolledCourses := make([]Course, 0)
	for _, course := range user.EnrolledCourses {
		if !contains(coursesToRemove, course.ID) {
			newEnrolledCourses = append(newEnrolledCourses, course)
		}
	}

	filter := bson.M{"_id": userID}
	update := bson.M{
		"$set": bson.M{
			"enrolledCourses": newEnrolledCourses,
		},
		"$push": bson.M{
			"gradedCourses": bson.M{"$each": newGradedCourses},
		},
		"$inc": bson.M{
			"totalCreditHours": additionalCreditHours,
		},
	}
	collection := GetCollection("users")

	result, err := collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return nil, fmt.Errorf("error updating user: %v", err)
	}

	// Step 6: Update GPA
	_, err = UpdateGPA(userID)
	if err != nil {
		return result, fmt.Errorf("courses added successfully but error updating GPA: %v", err)
	}

	return result, nil
}

func contains(slice []primitive.ObjectID, item primitive.ObjectID) bool {
	for _, a := range slice {
		if a == item {
			return true
		}
	}
	return false
}
