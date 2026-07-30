package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/smartx-web/idoma-connect/backend/internal/business/model"
	"github.com/smartx-web/idoma-connect/backend/internal/business/repository"
)

func GetBusinesses(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": repository.Businesses,
	})
}

func CreateBusiness(c *gin.Context) {

	var business model.Business

	if err := c.ShouldBindJSON(&business); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request",
		})
		return
	}

	business.ID = uint(len(repository.Businesses) + 1)

	repository.Businesses = append(repository.Businesses, business)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Business created successfully",
		"data": business,
	})
}
