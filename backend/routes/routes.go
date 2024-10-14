package routes

import (
	"hermes/controllers"
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
	{
		userapi.POST("/add", controllers.CreateUser)
		userapi.GET("/get", controllers.GetUser)
	}
	authapi := router.Group("/api/auth")
	{
		authapi.POST("/login", controllers.Login)
	}
	tribuneapi := router.Group("/api/tribune")
	tribuneapi.Use(middleware.RequireAuth)
	{
		tribuneapi.POST("/add", controllers.CreateTribune)
		tribuneapi.POST("/update", controllers.UpdateTribune)
		tribuneapi.GET("/get", controllers.GetTribune)
		tribuneapi.GET("/getall", controllers.GetAllTribunes)
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
