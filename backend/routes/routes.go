package routes

import (
	"hermes/controllers"
	"hermes/database"
	"hermes/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	// "go.mongodb.org/mongo-driver/x/mongo/driver/auth"
)

func RegisterRoutes(router *gin.Engine) {
	//THE CORS CONFIG BELOW IS VERY UNSAFE AND IS ONLY FOR DEVELOPMENT
	router.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			return true
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 3600,
	}))

	api := router.Group("/api/v1")
	{
		api.GET("/health", controllers.HealthCheck)
	}

	userapi := router.Group("/api/user")
	userapi.Use(middleware.AuthenticationMiddleware())
	{
		userapi.GET("/get", middleware.AuthorizationMiddleware(database.UserRole.Admin, database.UserRole.Moderator), controllers.GetUser)
		userapi.GET("/data", controllers.UserData)
		userapi.PATCH("/update", middleware.AuthorizationMiddleware(database.UserRole.Admin), controllers.UpdateUser)
		userapi.GET("/getall", middleware.AuthorizationMiddleware(database.UserRole.Admin, database.UserRole.Moderator), controllers.GetAllUsers)
		userapi.GET("/delete", middleware.AuthorizationMiddleware(database.UserRole.Admin), controllers.DeleteUsers)
		userapi.GET("/getprofilepic", controllers.GetProfilePicture)
		userapi.POST("/addprofilepic", controllers.AddProfilePicture)
		userapi.POST("/addtask", controllers.AddTask)
		userapi.PATCH("/updatetask", controllers.UpdateTask)
		userapi.POST("/deletetask", controllers.DeleteTask)
		userapi.GET("/gettask", controllers.GetTask)
		userapi.PATCH("/changePassword", controllers.ChangeUserPassword)
		userapi.GET("/getalltasks", controllers.GetAllTasks)
	}

	authapi := router.Group("/api/auth")
	{
		authapi.POST("/add", middleware.AuthorizationMiddleware(database.UserRole.Admin), controllers.CreateUser)
		authapi.POST("/login", controllers.Login)
		authapi.POST("/requestResetpassword", controllers.RequestResetPassword)
		authapi.POST("/resetpassword", controllers.ResetPassword)
	}

	tribuneapi := router.Group("/api/tribune")
	tribuneapi.Use(middleware.AuthenticationMiddleware())
	{
		tribuneapi.POST("/add", middleware.AuthorizationMiddleware(database.UserRole.Admin, database.UserRole.Staff), controllers.CreateTribune)
		tribuneapi.PATCH("/update", middleware.AuthorizationMiddleware(database.UserRole.Admin, database.UserRole.Staff), controllers.UpdateTribune)
		tribuneapi.GET("/get", controllers.GetTribune)
		tribuneapi.GET("/getall", controllers.GetAllTribunes)
	}

	lectureapi := router.Group("/api/lecture")
	lectureapi.Use(middleware.AuthenticationMiddleware())
	{
		lectureapi.POST("/add", middleware.AuthorizationMiddleware(database.UserRole.Admin), controllers.CreateLecture)
		lectureapi.GET("/get", controllers.GetLecture)
		lectureapi.GET("/getall", controllers.GetAllLectures)
		lectureapi.GET("/delete", middleware.AuthorizationMiddleware(database.UserRole.Admin), controllers.DeleteLecture)
		lectureapi.POST("/enroll", controllers.EnrollUserInLecture)
		//lectureapi.POST("/update", controllers.UpdateLecture)
	}
	courseapi := router.Group("/api/course")
	courseapi.Use(middleware.AuthenticationMiddleware())
	{
		courseapi.POST("/add", middleware.AuthorizationMiddleware(database.UserRole.Admin), controllers.CreateCourse)
		courseapi.GET("/get", controllers.GetCourse)
		courseapi.GET("/getbycode", controllers.GetCourseByCode)
		courseapi.PATCH("/update", middleware.AuthorizationMiddleware(database.UserRole.Admin), controllers.UpdateCourse)
		courseapi.DELETE("/delete", middleware.AuthorizationMiddleware(database.UserRole.Admin), controllers.DeleteCourse)
		courseapi.GET("/getall", controllers.GetAllCourses)
	}
	sectionapi := router.Group("/api/section")
	sectionapi.Use(middleware.AuthenticationMiddleware())
	{
		sectionapi.POST("/add", middleware.AuthorizationMiddleware(database.UserRole.Admin), controllers.CreateSection)
		sectionapi.GET("/get", controllers.GetSection)
		sectionapi.PATCH("/update", middleware.AuthorizationMiddleware(database.UserRole.Admin), controllers.UpdateSection)
		sectionapi.DELETE("/delete", middleware.AuthorizationMiddleware(database.UserRole.Admin), controllers.DeleteSection)
		sectionapi.GET("/getall", controllers.GetAllSections)
		sectionapi.POST("/enroll", controllers.EnrollUser)
		sectionapi.GET("/canenroll", controllers.CanEnrollUser)
	}

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	router.GET("/validate", middleware.RequireAuth, func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "you are logged in",
		})
	})
}
