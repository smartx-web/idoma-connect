package router

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	businesscontroller "github.com/smartx-web/idoma-connect/backend/internal/business/controller"
	categorycontroller "github.com/smartx-web/idoma-connect/backend/internal/category/controller"
	lgacontroller "github.com/smartx-web/idoma-connect/backend/internal/lga/controller"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()

	// Allow the frontend to communicate with the API
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5500"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
	}))

	api := router.Group("/api/v1")
	{
		// Health
		api.GET("/health", HealthCheck)

		// Businesses
		api.GET("/businesses", businesscontroller.GetBusinesses)
		api.GET("/businesses/:id", businesscontroller.GetBusinessByID)
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
