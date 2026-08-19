package controller

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/smartx-web/idoma-connect/backend/internal/business/model"
	"github.com/smartx-web/idoma-connect/backend/internal/business/repository"
)

func GetBusinesses(c *gin.Context) {
	lga := strings.TrimSpace(c.Query("lga"))
	category := strings.TrimSpace(c.Query("category"))
	search := strings.TrimSpace(c.Query("search"))

	var results []model.Business

	for _, business := range repository.Businesses {

		if lga != "" && !strings.EqualFold(business.LGA, lga) {
			continue
		}

		if category != "" && !strings.EqualFold(business.Category, category) {
			continue
		}

		if search != "" {
			searchLower := strings.ToLower(search)
			nameMatch := strings.Contains(strings.ToLower(business.Name), searchLower)
			descriptionMatch := strings.Contains(strings.ToLower(business.Description), searchLower)

			if !nameMatch && !descriptionMatch {
				continue
			}
		}

		results = append(results, business)
	}

	if results == nil {
		results = []model.Business{}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"count":   len(results),
		"data":    results,
	})
}
func GetBusinessByID(c *gin.Context) {
	id := c.Param("id")

	for _, business := range repository.Businesses {
		if fmt.Sprintf("%d", business.ID) == id {
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"data":    business,
			})
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{
		"success": false,
		"message": "Business not found",
	})
}

func CreateBusiness(c *gin.Context) {
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

	business.ID = uint(len(repository.Businesses) + 1)

	repository.Businesses = append(repository.Businesses, business)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Business created successfully",
		"data":    business,
	})
}
