package controller

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/smartx-web/idoma-connect/backend/internal/business/model"
	"github.com/smartx-web/idoma-connect/backend/internal/business/repository"
)

type BusinessController struct {
	Repository *repository.BusinessRepository
}

func NewBusinessController(repo *repository.BusinessRepository) *BusinessController {
	return &BusinessController{
		Repository: repo,
	}
}

func (bc *BusinessController) GetBusinesses(c *gin.Context) {
	lga := strings.TrimSpace(c.Query("lga"))
	category := strings.TrimSpace(c.Query("category"))
	search := strings.TrimSpace(c.Query("search"))

	businesses, err := bc.Repository.GetBusinesses(
		c.Request.Context(),
		lga,
		category,
		search,
	)

	if err != nil {
		c.Error(err)

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch businesses",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"count":   len(businesses),
		"data":    businesses,
	})
}

func (bc *BusinessController) GetBusinessByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid business ID",
		})
		return
	}

	business, err := bc.Repository.GetBusinessByID(
		c.Request.Context(),
		uint(id),
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Business not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    business,
	})
}

func (bc *BusinessController) CreateBusiness(c *gin.Context) {
	var business model.Business

	if err := c.ShouldBindJSON(&business); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
		})
		return
	}

	// Basic validation
	if strings.TrimSpace(business.Name) == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Business name is required",
		})
		return
	}

	if strings.TrimSpace(business.Category) == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Business category is required",
		})
		return
	}

	if strings.TrimSpace(business.LGA) == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "LGA is required",
		})
		return
	}

	if strings.TrimSpace(business.Phone) == "" &&
		strings.TrimSpace(business.WhatsApp) == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "At least one contact number is required",
		})
		return
	}

	createdBusiness, err := bc.Repository.CreateBusiness(
		c.Request.Context(),
		business,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create business",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Business created successfully",
		"data":    createdBusiness,
	})
}

// GetPendingBusinesses returns all businesses waiting for admin approval.
func (bc *BusinessController) GetPendingBusinesses(c *gin.Context) {
	businesses, err := bc.Repository.GetBusinessesByStatus(
		c.Request.Context(),
		"pending",
	)

	if err != nil {
		c.Error(err)

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch pending businesses",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"count":   len(businesses),
		"data":    businesses,
	})
}

// ApproveBusiness approves a pending business.
func (bc *BusinessController) ApproveBusiness(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid business ID",
		})
		return
	}

	business, err := bc.Repository.UpdateBusinessStatus(
		c.Request.Context(),
		uint(id),
		"approved",
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to approve business",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Business approved successfully",
		"data":    business,
	})
}

// RejectBusiness rejects a business submission.
func (bc *BusinessController) RejectBusiness(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid business ID",
		})
		return
	}

	business, err := bc.Repository.UpdateBusinessStatus(
		c.Request.Context(),
		uint(id),
		"rejected",
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to reject business",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Business rejected successfully",
		"data":    business,
	})
}

// GetApprovedBusinesses returns all approved businesses.
func (bc *BusinessController) GetApprovedBusinesses(c *gin.Context) {
	businesses, err := bc.Repository.GetBusinessesByStatus(
		c.Request.Context(),
		"approved",
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch approved businesses",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"count":   len(businesses),
		"data":    businesses,
	})
}

// GetRejectedBusinesses returns all rejected businesses.
func (bc *BusinessController) GetRejectedBusinesses(c *gin.Context) {
	businesses, err := bc.Repository.GetBusinessesByStatus(
		c.Request.Context(),
		"rejected",
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch rejected businesses",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"count":   len(businesses),
		"data":    businesses,
	})
}
