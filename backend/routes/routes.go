package routes

import (
	"hermes/controllers"
	"hermes/middleware"

	"github.com/gin-gonic/gin"
	// "go.mongodb.org/mongo-driver/x/mongo/driver/auth"
)

func RegisterRoutes(router *gin.Engine) {
	api := router.Group("/api/v1")
	{
		api.GET("/health", controllers.HealthCheck)
	}
	dbapi := router.Group("/api/db")
	{
		dbapi.POST("/adduser", controllers.CreateUser)
		dbapi.GET("/getuser", controllers.GetUser)
	}
	authapi := router.Group("/api/auth")
	{
		authapi.POST("/login", controllers.Login)
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
