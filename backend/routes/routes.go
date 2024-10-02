package routes

import (
	"hermes/controllers"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine) {
	api := router.Group("/api/v1")
	{
		api.GET("/health", controllers.HealthCheck)
	}
}
