package router

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	authcontroller "github.com/smartx-web/idoma-connect/backend/internal/auth/controller"
	authmiddleware "github.com/smartx-web/idoma-connect/backend/internal/auth/middleware"
	businesscontroller "github.com/smartx-web/idoma-connect/backend/internal/business/controller"
	businessrepository "github.com/smartx-web/idoma-connect/backend/internal/business/repository"
	categorycontroller "github.com/smartx-web/idoma-connect/backend/internal/category/controller"
	happeningcontroller "github.com/smartx-web/idoma-connect/backend/internal/happening/controller"
	happeningrepository "github.com/smartx-web/idoma-connect/backend/internal/happening/repository"
	lgacontroller "github.com/smartx-web/idoma-connect/backend/internal/lga/controller"
	premiumcontroller "github.com/smartx-web/idoma-connect/backend/internal/premium/controller"
	premiumrepository "github.com/smartx-web/idoma-connect/backend/internal/premium/repository"
)

func SetupRouter(db *pgxpool.Pool) *gin.Engine {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5500",
		},
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"DELETE",
			"OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
		},
	}))

	// Business dependencies
	businessRepo := businessrepository.NewBusinessRepository(db)
	businessController := businesscontroller.NewBusinessController(businessRepo)

	// Happening dependencies
	happeningRepo := happeningrepository.NewHappeningRepository(db)
	happeningController := happeningcontroller.NewHappeningController(happeningRepo)

	// Premium listing dependencies
	premiumRepo := premiumrepository.NewPremiumRepository(db)
	premiumController := premiumcontroller.NewPremiumController(premiumRepo)

	// Authentication
	authController := authcontroller.NewAuthController()

	api := router.Group("/api/v1")
	{
		// =========================================================
		// PUBLIC ROUTES
		// =========================================================

		// Health
		api.GET("/health", HealthCheck)

		// Authentication
		api.POST("/auth/login", authController.Login)

		// Public business routes
		api.GET("/businesses", businessController.GetBusinesses)
		api.GET("/businesses/:id", businessController.GetBusinessByID)
		api.POST("/businesses", businessController.CreateBusiness)

		// Categories
		api.GET("/categories", categorycontroller.GetCategories)

		// LGAs
		api.GET("/lgas", lgacontroller.GetLGAs)

		// Public happenings
		api.GET("/happenings", happeningController.GetAll)

		// Public premium listings
		api.GET("/premium", premiumController.GetActive)

		// =========================================================
		// PROTECTED ADMIN ROUTES
		// =========================================================

		admin := api.Group("/admin")
		admin.Use(authmiddleware.RequireAdmin())
		{
			// Business approval
			admin.GET(
				"/businesses/approved",
				businessController.GetApprovedBusinesses,
			)

			admin.GET(
				"/businesses/rejected",
				businessController.GetRejectedBusinesses,
			)

			admin.GET(
				"/businesses/pending",
				businessController.GetPendingBusinesses,
			)

			admin.PUT(
				"/businesses/:id/approve",
				businessController.ApproveBusiness,
			)

			admin.PUT(
				"/businesses/:id/reject",
				businessController.RejectBusiness,
			)

			// Happenings
			admin.POST("/happenings", happeningController.Create)
			admin.GET("/happenings", happeningController.GetAllAdmin)
			admin.PUT("/happenings/:id/status", happeningController.UpdatePublished)

			// Premium listings
			admin.GET(
				"/premium",
				premiumController.GetAll,
			)

			admin.POST(
				"/premium",
				premiumController.Create,
			)

			admin.PUT(
				"/premium/:id/status",
				premiumController.UpdateStatus,
			)
		}
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
