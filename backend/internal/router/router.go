package router

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	businesscontroller "github.com/smartx-web/idoma-connect/backend/internal/business/controller"
	businessrepository "github.com/smartx-web/idoma-connect/backend/internal/business/repository"
	categorycontroller "github.com/smartx-web/idoma-connect/backend/internal/category/controller"
	happeningcontroller "github.com/smartx-web/idoma-connect/backend/internal/happening/controller"
	happeningrepository "github.com/smartx-web/idoma-connect/backend/internal/happening/repository"
	lgacontroller "github.com/smartx-web/idoma-connect/backend/internal/lga/controller"
)

func SetupRouter(db *pgxpool.Pool) *gin.Engine {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5500"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Accept"},
	}))

	// Business dependencies
	businessRepo := businessrepository.NewBusinessRepository(db)
	businessController := businesscontroller.NewBusinessController(businessRepo)

	// Happening dependencies
	happeningRepo := happeningrepository.NewHappeningRepository(db)
	happeningController := happeningcontroller.NewHappeningController(happeningRepo)

	api := router.Group("/api/v1")
	{
		// Health
		api.GET("/health", HealthCheck)

		// Public business routes
		api.GET("/businesses", businessController.GetBusinesses)
		api.GET("/businesses/:id", businessController.GetBusinessByID)
		api.POST("/businesses", businessController.CreateBusiness)

		// Admin business approval routes
		api.GET("/admin/businesses/pending", businessController.GetPendingBusinesses)
		api.PUT("/admin/businesses/:id/approve", businessController.ApproveBusiness)
		api.PUT("/admin/businesses/:id/reject", businessController.RejectBusiness)

		// Categories
		api.GET("/categories", categorycontroller.GetCategories)

		// LGAs
		api.GET("/lgas", lgacontroller.GetLGAs)

		// Happenings
		api.GET("/happenings", happeningController.GetAll)
		api.POST("/happenings", happeningController.Create)
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
