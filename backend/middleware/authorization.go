package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func AuthorizationMiddleware(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Role not found"})
			return
		}
		for _, allowedRole := range allowedRoles {
			if role.(string) == allowedRole {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Unauthorized user access denied"})
	}
}
