package middleware

import (
	"fmt"
	"hermes/helpers"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	leakRate        = 50 * time.Second
	capacity        = 5
	tooManyRequests = "Too many requests, please try again later."
)

var (
	rmHandler *helpers.RateLimitingHandler
	once      sync.Once
)

func RateLimitMiddleware() gin.HandlerFunc {

	once.Do(func() {
		rmHandler = helpers.NewRateLimitingHandler(leakRate, capacity)
	})

	return func(c *gin.Context) {
		ip := c.ClientIP()
		fmt.Println("IP: ", ip)
		limiter := rmHandler.Get(ip)

		if !limiter.Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"message": tooManyRequests,
			})
			return
		}

		c.Next()
	}
}
