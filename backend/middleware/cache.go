package middleware

import (
	"encoding/json"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis"
)

func CacheMiddleware(cacheService CacheServices) gin.HandlerFunc {
	return func(c *gin.Context) {
		key := c.Request.URL.Path

		if v, err := cacheService.GetCache(key); err != nil {
			c.AbortWithStatusJSON(http.StatusOK, v)
			return
		}

		c.Next()

		cacheService.SetCache(key, c.Keys["Response"])
	}
}

type CacheModel struct {
	Value      interface{} `json:"value"`
	Expiration int64       `json:"expiration"`
}

type CacheServices struct {
	serverCache *sync.Map
	redisClient *redis.Client
}

func InitCacheServices() *CacheServices {

	redisClient := redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_ADDRESS"),
		Password: os.Getenv("REDIS_PASSWORD"),
		DB:       0,
	})

	return &CacheServices{
		serverCache: &sync.Map{},
		redisClient: redisClient,
	}
}

func (cs *CacheServices) SetCache(key string, value interface{}) {

	entry := CacheModel{
		Value:      value.(string),
		Expiration: time.Now().Add(time.Minute * 10).Unix(),
	}

	cs.serverCache.Store(key, entry)
	jsonItem, _ := json.Marshal(entry)
	cs.redisClient.Set(key, jsonItem, time.Duration(entry.Expiration))
}

func (cs *CacheServices) GetCache(key string) (interface{}, error) {
	if v, ok := cs.serverCache.Load(key); ok {
		return v, nil
	}

	value, err := cs.redisClient.Get(key).Result()
	if err == redis.Nil {
		return nil, nil
	} else if err != nil {
		return nil, err
	}

	var cacheItem CacheModel
	json.Unmarshal([]byte(value), &cacheItem)

	if time.Now().Unix() > cacheItem.Expiration {
		cs.DeleteCache(key)
		return nil, nil
	}

	return cacheItem.Value, nil
}

func (cs *CacheServices) DeleteCache(key string) {
	cs.serverCache.Delete(key)
	cs.redisClient.Del(key)
}
