package middleware

import (
	"hermes/database"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RequireAdmin(c *gin.Context) {
	var user database.User
	if val, ok := c.Get("user"); ok {
		user = val.(database.User)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "????"})
		return
	}
	user, err := database.GetUserByID(user.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "not a real user"})
		return
	}
	if user.Privilege != 2 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not an admin"})
		return
	}
	c.Next()

}
