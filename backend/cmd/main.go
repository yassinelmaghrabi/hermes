package main

import (
	"log"
	"os"

	"hermes/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env")
	}
	router := gin.Default()
	routes.RegisterRoutes(router)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Starting server on port %s...", port)
	router.Run("localhost:" + port)
}
