package router

import (
	"github.com/gin-gonic/gin"
	"github.com/smartx-web/idoma-connect/backend/internal/business/controller"
	"github.com/smartx-web/idoma-connect/backend/internal/category/controller"
	)

func SetupRouter() *gin.Engine {
	router := gin.Default()

	api := router.Group("/api/v1")
	{
		api.GET("/health", HealthCheck)
		api.GET("/businesses", controller.GetBusinesses)
		api.GET("/categories", categorycontroller.GetCategories)
		api.GET("/lgas", lgacontroller.GetLGAs)
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
