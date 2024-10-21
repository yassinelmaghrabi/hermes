package routes

import (
	"hermes/controllers"
	"hermes/database"
	"hermes/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine) {

	router.Use(cors.New(cors.Config{
		AllowOriginFunc:  func(origin string) bool { return true },
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 3600,
	}))

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	router.GET("/validate", middleware.RequireAuth, func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "you are logged in"})
	})

	api := router.Group("/api")
	{
		api.GET("/health", controllers.HealthCheck)
	}

	userapi := api.Group("/users")
	userapi.Use(middleware.AuthenticationMiddleware())
	{
		userapi.GET("/", middleware.AuthorizationMiddleware(database.UserRole.Admin, database.UserRole.Moderator), controllers.GetAllUsers)
		userapi.GET("/id", middleware.AuthorizationMiddleware(database.UserRole.Admin, database.UserRole.Moderator), controllers.GetUser)
		userapi.PATCH("/", middleware.AuthorizationMiddleware(database.UserRole.Admin), controllers.UpdateUser)
		userapi.DELETE("/", middleware.AuthorizationMiddleware(database.UserRole.Admin), controllers.DeleteUsers)
		userapi.GET("/data", controllers.UserData)

		userapi.GET("/profilePic", controllers.GetProfilePicture)
		userapi.POST("/profilePic", controllers.AddProfilePicture)

		userapi.PATCH("/change-password", controllers.ChangeUserPassword)
	}

	authapi := api.Group("/auth")
	{
		authapi.POST("/register", controllers.CreateUser)
		authapi.POST("/login", controllers.Login)
		authapi.POST("/password/request-reset", controllers.RequestResetPassword)
		authapi.POST("/password/reset", controllers.ResetPassword)
	}

	tribuneapi := api.Group("/tribunes")
	tribuneapi.Use(middleware.AuthenticationMiddleware())
	{
		tribuneapi.POST("/", middleware.AuthorizationMiddleware(database.UserRole.Admin, database.UserRole.Staff), controllers.CreateTribune)
		tribuneapi.PATCH("/", middleware.AuthorizationMiddleware(database.UserRole.Admin, database.UserRole.Staff), controllers.UpdateTribune)
		tribuneapi.GET("/", controllers.GetTribune)
		tribuneapi.GET("/all", controllers.GetAllTribunes)
	}

	taskapi := api.Group("/tasks")
	taskapi.Use(middleware.AuthenticationMiddleware())
	{
		taskapi.POST("/", controllers.AddTask)
		taskapi.GET("/all", controllers.GetAllTasks)
		taskapi.GET("/", controllers.GetTask)
		taskapi.PATCH("/", controllers.UpdateTask)
		taskapi.DELETE("/", controllers.DeleteTask)
	}

	lectureapi := api.Group("/lectures")
	lectureapi.Use(middleware.AuthenticationMiddleware())
	{
		lectureapi.POST("/", middleware.AuthorizationMiddleware(database.UserRole.Admin), controllers.CreateLecture)
		lectureapi.PATCH("/", middleware.AuthorizationMiddleware(database.UserRole.Admin), controllers.UpdateLecture)
		lectureapi.DELETE("/", middleware.AuthorizationMiddleware(database.UserRole.Admin), controllers.DeleteLecture)
		lectureapi.GET("/all", controllers.GetAllLectures)
		lectureapi.GET("/", controllers.GetLecture)
		lectureapi.POST("/enroll", controllers.EnrollUserInLecture)
	}

	courseapi := api.Group("/courses")
	courseapi.Use(middleware.AuthenticationMiddleware())
	{
		courseapi.POST("/", middleware.AuthorizationMiddleware(database.UserRole.Admin), controllers.CreateCourse)
		courseapi.PATCH("/", middleware.AuthorizationMiddleware(database.UserRole.Admin), controllers.UpdateCourse)
		courseapi.DELETE("/", middleware.AuthorizationMiddleware(database.UserRole.Admin), controllers.DeleteCourse)
		courseapi.GET("/all", controllers.GetAllCourses)
		courseapi.GET("/", controllers.GetCourse)
		courseapi.GET("/code", controllers.GetCourseByCode)
	}

	sectionapi := api.Group("/sections")
	sectionapi.Use(middleware.AuthenticationMiddleware())
	{
		sectionapi.POST("/", middleware.AuthorizationMiddleware(database.UserRole.Admin), controllers.CreateSection)
		sectionapi.PATCH("/", middleware.AuthorizationMiddleware(database.UserRole.Admin), controllers.UpdateSection)
		sectionapi.DELETE("/", middleware.AuthorizationMiddleware(database.UserRole.Admin), controllers.DeleteSection)
		sectionapi.GET("/all", controllers.GetAllSections)
		sectionapi.GET("/", controllers.GetSection)
		sectionapi.POST("enroll", controllers.EnrollUser)
		sectionapi.GET("/canenroll", controllers.CanEnrollUser)
	}
}
