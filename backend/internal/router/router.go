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
	soundcontroller "github.com/smartx-web/idoma-connect/backend/internal/sound/controller"
	soundrepository "github.com/smartx-web/idoma-connect/backend/internal/sound/repository"
)

func SetupRouter(db *pgxpool.Pool) *gin.Engine {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5500",
			"https://idoma-connect.onrender.com",
			"http://127.0.0.1:5500",
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

	// =========================================================
	// BUSINESS DEPENDENCIES
	// =========================================================

	businessRepo := businessrepository.NewBusinessRepository(db)
	businessController := businesscontroller.NewBusinessController(businessRepo)

	// =========================================================
	// HAPPENING DEPENDENCIES
	// =========================================================

	happeningRepo := happeningrepository.NewHappeningRepository(db)
	happeningController := happeningcontroller.NewHappeningController(happeningRepo)

	// =========================================================
	// PREMIUM LISTING DEPENDENCIES
	// =========================================================

	premiumRepo := premiumrepository.NewPremiumRepository(db)
	premiumController := premiumcontroller.NewPremiumController(premiumRepo)

	// =========================================================
	// AUTHENTICATION
	// =========================================================

	authController := authcontroller.NewAuthController()

	// =========================================================
	// IDOMA SOUNDS DEPENDENCIES
	// =========================================================

	soundCategoryRepo := soundrepository.NewCategoryRepository(db)
	soundCategoryController := soundcontroller.NewCategoryController(soundCategoryRepo)

	soundArtistRepo := soundrepository.NewArtistRepository(db)
	soundArtistController := soundcontroller.NewArtistController(soundArtistRepo)

	soundAlbumRepo := soundrepository.NewAlbumRepository(db)
	soundAlbumController := soundcontroller.NewAlbumController(soundAlbumRepo)

	soundSongRepo := soundrepository.NewSongRepository(db)
	soundSongController := soundcontroller.NewSongController(soundSongRepo)

	soundCulturalRecordingRepo := soundrepository.NewCulturalRecordingRepository(db)
	soundCulturalRecordingController :=
		soundcontroller.NewCulturalRecordingController(soundCulturalRecordingRepo)

	soundSubmissionRepo := soundrepository.NewSubmissionRepository(db)
	soundSubmissionController :=
		soundcontroller.NewSubmissionController(soundSubmissionRepo)

	// =========================================================
	// API
	// =========================================================

	api := router.Group("/api/v1")
	{
		// =====================================================
		// PUBLIC ROUTES
		// =====================================================

		// Health
		api.GET("/health", HealthCheck)

		// Authentication
		api.POST("/auth/login", authController.Login)

		// -----------------------------------------------------
		// Businesses
		// -----------------------------------------------------

		api.GET("/businesses", businessController.GetBusinesses)
		api.GET("/businesses/:id", businessController.GetBusinessByID)
		api.POST("/businesses", businessController.CreateBusiness)

		// -----------------------------------------------------
		// Categories
		// -----------------------------------------------------

		api.GET("/categories", categorycontroller.GetCategories)

		// -----------------------------------------------------
		// LGAs
		// -----------------------------------------------------

		api.GET("/lgas", lgacontroller.GetLGAs)

		// -----------------------------------------------------
		// Happenings
		// -----------------------------------------------------

		api.GET("/happenings", happeningController.GetAll)

		// -----------------------------------------------------
		// Premium Listings
		// -----------------------------------------------------

		api.GET("/premium", premiumController.GetActive)

		// =====================================================
		// IDOMA SOUNDS
		// =====================================================

		// Sound categories
		api.GET(
			"/sounds/categories",
			soundCategoryController.GetAll,
		)

		api.GET(
			"/sounds/categories/:id",
			soundCategoryController.GetByID,
		)

		// Artists
		api.GET(
			"/sounds/artists",
			soundArtistController.GetApproved,
		)

		api.GET(
			"/sounds/artists/:id",
			soundArtistController.GetByID,
		)

		// Albums
		api.GET(
			"/sounds/albums",
			soundAlbumController.GetApproved,
		)

		api.GET(
			"/sounds/artists/:id/albums",
			soundAlbumController.GetByArtist,
		)

		// Songs
		api.GET(
			"/sounds/songs",
			soundSongController.GetApproved,
		)

		api.GET(
			"/sounds/songs/featured",
			soundSongController.GetFeatured,
		)

		api.GET(
			"/sounds/songs/category/:id",
			soundSongController.GetByCategory,
		)

		api.GET(
			"/sounds/songs/:id",
			soundSongController.GetByID,
		)

		api.POST(
			"/sounds/songs/:id/play",
			soundSongController.IncrementPlayCount,
		)

		// Cultural recordings
		api.GET(
			"/sounds/cultural-recordings",
			soundCulturalRecordingController.GetPublished,
		)

		// Public sound submissions
		api.POST(
			"/sounds/submissions",
			soundSubmissionController.Create,
		)

		// =====================================================
		// PROTECTED ADMIN ROUTES
		// =====================================================

		admin := api.Group("/admin")
		admin.Use(authmiddleware.RequireAdmin())
		{
			// -------------------------------------------------
			// Business approval
			// -------------------------------------------------

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

			// -------------------------------------------------
			// Happenings
			// -------------------------------------------------

			admin.POST(
				"/happenings",
				happeningController.Create,
			)

			admin.GET(
				"/happenings",
				happeningController.GetAllAdmin,
			)

			admin.GET(
				"/happenings/stats",
				happeningController.GetStats,
			)

			admin.PUT(
				"/happenings/:id",
				happeningController.Update,
			)

			admin.PUT(
				"/happenings/:id/status",
				happeningController.UpdatePublished,
			)

			admin.DELETE(
				"/happenings/:id",
				happeningController.Delete,
			)

			// -------------------------------------------------
			// Premium listings
			// -------------------------------------------------

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

			// =================================================
			// IDOMA SOUNDS - ADMIN
			// =================================================

			// -------------------------------------------------
			// Artists
			// -------------------------------------------------

			admin.GET(
				"/sounds/artists",
				soundArtistController.GetAll,
			)

			admin.POST(
				"/sounds/artists",
				soundArtistController.Create,
			)

			admin.PUT(
				"/sounds/artists/:id/status",
				soundArtistController.UpdateStatus,
			)

			// -------------------------------------------------
			// Albums
			// -------------------------------------------------

			admin.POST(
				"/sounds/albums",
				soundAlbumController.Create,
			)

			admin.PUT(
				"/sounds/albums/:id/status",
				soundAlbumController.UpdateStatus,
			)

			// -------------------------------------------------
			// Songs
			// -------------------------------------------------

			admin.GET("/sounds/songs", soundSongController.GetAll)

			admin.POST(
				"/sounds/songs",
				soundSongController.Create,
			)

			admin.PUT(
				"/sounds/songs/:id/status",
				soundSongController.UpdateStatus,
			)

			// -------------------------------------------------
			// Cultural recordings
			// -------------------------------------------------

			admin.GET(
				"/sounds/cultural-recordings",
				soundCulturalRecordingController.GetAll,
			)

			admin.POST(
				"/sounds/cultural-recordings",
				soundCulturalRecordingController.Create,
			)

			admin.PUT(
				"/sounds/cultural-recordings/:id/status",
				soundCulturalRecordingController.UpdatePublished,
			)

			// -------------------------------------------------
			// Sound submissions
			// -------------------------------------------------

			admin.GET(
				"/sounds/submissions",
				soundSubmissionController.GetAll,
			)

			admin.GET(
				"/sounds/submissions/status",
				soundSubmissionController.GetByStatus,
			)

			admin.PUT(
				"/sounds/submissions/:id/status",
				soundSubmissionController.UpdateStatus,
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
