package router

import "github.com/gin-gonic/gin"

func SetupRouter() *gin.Engine {
	router := gin.Default()

	api := router.Group("/api/v1")
	{
		api.GET("/health", HealthCheck)
	}

	return router
}

func HealthCheck(c *gin.Context) {
	c.JSON(200, gin.H{
		"success": true,
		"message": "IDOMA CONNECT API is running",
		"version": "v1",
	})
}
