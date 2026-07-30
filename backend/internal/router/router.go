package router

import (
	"github.com/gin-gonic/gin"

	businesscontroller "github.com/smartx-web/idoma-connect/backend/internal/business/controller"
	categorycontroller "github.com/smartx-web/idoma-connect/backend/internal/category/controller"
	lgacontroller "github.com/smartx-web/idoma-connect/backend/internal/lga/controller"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()

	api := router.Group("/api/v1")
	{
		// Health
		api.GET("/health", HealthCheck)

		// Businesses
		api.GET("/businesses", businesscontroller.GetBusinesses)
		api.POST("/businesses", businesscontroller.CreateBusiness)

		// Categories
		api.GET("/categories", categorycontroller.GetCategories)

		// LGAs
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
