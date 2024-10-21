package middleware

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis"
)

type CacheModel struct {
	Value      []byte    `json:"value"`
	Expiration time.Time `json:"expiration"`
}

type CacheServices struct {
	serverCache *sync.Map
	redisClient *redis.Client
}

func InitCacheServices(redisUrl string) *CacheServices {
	opt, err := redis.ParseURL(redisUrl)
	if err != nil {
		panic(err)
	}

	redisClient := redis.NewClient(opt)

	return &CacheServices{
		serverCache: &sync.Map{},
		redisClient: redisClient,
	}
}

func CacheMiddleware(cacheService *CacheServices, duration time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		key := c.Request.URL.String()

		if cachedResponse, err := cacheService.GetCache(key); err == nil && cachedResponse != nil {
			fmt.Println("Cache hit")
			c.Data(http.StatusOK, "application/json", cachedResponse)
			c.Abort()
			return
		}

		w := &responseWriter{body: &bytes.Buffer{}, ResponseWriter: c.Writer}
		c.Writer = w
		c.Next()

		if c.Writer.Status() == http.StatusOK {
			fmt.Println("Cache miss")
			cacheService.SetCache(key, w.body.Bytes(), duration)
		}
	}
}

type responseWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (r *responseWriter) Write(b []byte) (int, error) {
	r.body.Write(b)
	return r.ResponseWriter.Write(b)
}

func (cs *CacheServices) SetCache(key string, value []byte, duration time.Duration) {
	expiration := time.Now().Add(duration)
	entry := CacheModel{
		Value:      value,
		Expiration: expiration,
	}

	jsonItem, _ := json.Marshal(entry)
	cs.serverCache.Store(key, jsonItem)
	cs.redisClient.Set(key, jsonItem, duration)
}

func (cs *CacheServices) GetCache(key string) ([]byte, error) {
	// Try local cache first
	if v, ok := cs.serverCache.Load(key); ok {
		var cacheItem CacheModel
		if err := json.Unmarshal(v.([]byte), &cacheItem); err == nil {
			if time.Now().Before(cacheItem.Expiration) {
				return cacheItem.Value, nil
			}
			cs.DeleteCache(key)
		}
	}

	value, err := cs.redisClient.Get(key).Bytes()
	if err == redis.Nil {
		return nil, nil
	} else if err != nil {
		return nil, err
	}

	var cacheItem CacheModel
	if err := json.Unmarshal(value, &cacheItem); err != nil {
		return nil, err
	}

	if time.Now().After(cacheItem.Expiration) {
		cs.DeleteCache(key)
		return nil, nil
	}

	cs.serverCache.Store(key, value)

	return cacheItem.Value, nil
}

func (cs *CacheServices) DeleteCache(key string) {
	cs.serverCache.Delete(key)
	cs.redisClient.Del(key)
}
