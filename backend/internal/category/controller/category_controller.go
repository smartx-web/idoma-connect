package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetCategories(c *gin.Context) {

	categories := []gin.H{
		{"id": 1, "name": "Hospital"},
		{"id": 2, "name": "Hotel"},
		{"id": 3, "name": "Restaurant"},
		{"id": 4, "name": "Pharmacy"},
		{"id": 5, "name": "Bank"},
		{"id": 6, "name": "School"},
		{"id": 7, "name": "Tourist Attraction"},
		{"id": 8, "name": "Market"},
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": categories,
	})
}
