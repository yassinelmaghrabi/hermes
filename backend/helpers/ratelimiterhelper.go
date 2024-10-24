package helpers

import (
	"sync"
	"time"
)

type RateLimitingHandler struct {
	requesters map[string]*LeakyBucket
	mu         sync.RWMutex
	leakRate   time.Duration
	capacity   int
}

func NewRateLimitingHandler(leakRate time.Duration, capacity int) *RateLimitingHandler {
	rlh := &RateLimitingHandler{
		requesters: make(map[string]*LeakyBucket),
		leakRate:   leakRate,
		capacity:   capacity,
	}
	return rlh
}

func (rlh *RateLimitingHandler) Get(ip string) *LeakyBucket {

	rlh.mu.Lock()
	defer rlh.mu.Unlock()

	if limiter, exists := rlh.requesters[ip]; exists {
		return limiter
	}

	rlh.requesters[ip] = &LeakyBucket{capacity: rlh.capacity, leakRate: rlh.leakRate}
	return rlh.requesters[ip]
}

type LeakyBucket struct {
	current    int
	capacity   int
	leakRate   time.Duration
	lastLeaked time.Time
	mu         sync.Mutex
}

func InitLeakyBucket(capacity int, leakRate time.Duration) *LeakyBucket {
	return &LeakyBucket{
		capacity:   capacity,
		current:    0,
		leakRate:   leakRate,
		lastLeaked: time.Now(),
	}
}

func (lb *LeakyBucket) Allow() bool {
	lb.mu.Lock()
	defer lb.mu.Unlock()

	elapsedTime := time.Since(lb.lastLeaked)
	tokensToLeak := int(elapsedTime / lb.leakRate)

	if tokensToLeak > 0 {
		updatedLeaks := maxInt(lb.current-tokensToLeak, 0)
		lb.current = updatedLeaks
		lb.lastLeaked = time.Now()
	}

	// if the bucket can carry more requests
	if lb.current < lb.capacity {
		lb.current++
		return true
	}
	return false
}

func maxInt(a int, b int) int {
	if a > b {
		return a
	}
	return b
}
