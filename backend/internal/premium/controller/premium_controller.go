package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/smartx-web/idoma-connect/backend/internal/premium/model"
	"github.com/smartx-web/idoma-connect/backend/internal/premium/repository"
)

type PremiumController struct {
	Repository *repository.PremiumRepository
}

func NewPremiumController(
	repo *repository.PremiumRepository,
) *PremiumController {

	return &PremiumController{
		Repository: repo,
	}
}

// =========================
// GET ALL PREMIUM LISTINGS
// =========================

func (pc *PremiumController) GetAll(
	c *gin.Context,
) {

	listings, err :=
		pc.Repository.GetAll(
			c.Request.Context(),
		)

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"success": false,
				"message": "Failed to fetch premium listings",
			},
		)

		return
	}

	c.JSON(
		http.StatusOK,
		gin.H{
			"success": true,
			"count":   len(listings),
			"data":    listings,
		},
	)
}

// =========================
// GET ACTIVE PREMIUM
// =========================

func (pc *PremiumController) GetActive(
	c *gin.Context,
) {

	listings, err :=
		pc.Repository.GetActive(
			c.Request.Context(),
		)

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"success": false,
				"message": "Failed to fetch active premium listings",
			},
		)

		return
	}

	c.JSON(
		http.StatusOK,
		gin.H{
			"success": true,
			"count":   len(listings),
			"data":    listings,
		},
	)
}

// =========================
// CREATE PREMIUM LISTING
// =========================

func (pc *PremiumController) Create(
	c *gin.Context,
) {

	var listing model.PremiumListing

	if err :=
		c.ShouldBindJSON(&listing); err != nil {

		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"success": false,
				"message": "Invalid request data",
			},
		)

		return
	}

	if listing.BusinessID == 0 {

		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"success": false,
				"message": "Business ID is required",
			},
		)

		return
	}

	if listing.Title == "" {

		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"success": false,
				"message": "Title is required",
			},
		)

		return
	}

	created, err :=
		pc.Repository.Create(
			c.Request.Context(),
			&listing,
		)

	if err != nil {

		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"success": false,
				"message": err.Error(),
			},
		)

		return
	}

	c.JSON(
		http.StatusCreated,
		gin.H{
			"success": true,
			"message": "Premium listing created successfully",
			"data":    created,
		},
	)
}

// =========================
// UPDATE PREMIUM STATUS
// =========================

func (pc *PremiumController) UpdateStatus(
	c *gin.Context,
) {

	idParam :=
		c.Param("id")

	id, err :=
		strconv.ParseUint(
			idParam,
			10,
			64,
		)

	if err != nil {

		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"success": false,
				"message": "Invalid premium listing ID",
			},
		)

		return
	}

	var request struct {
		Active bool `json:"active"`
	}

	if err :=
		c.ShouldBindJSON(&request); err != nil {

		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"success": false,
				"message": "Invalid request data",
			},
		)

		return
	}

	listing, err :=
		pc.Repository.UpdateStatus(
			c.Request.Context(),
			uint(id),
			request.Active,
		)

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"success": false,
				"message": "Failed to update premium listing",
			},
		)

		return
	}

	c.JSON(
		http.StatusOK,
		gin.H{
			"success": true,
			"message": "Premium listing status updated successfully",
			"data":    listing,
		},
	)
}
