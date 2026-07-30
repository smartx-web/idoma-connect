package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetBusinesses(c *gin.Context) {
	businesses := []gin.H{
		{
			"id":       1,
			"name":     "Royal Hospital",
			"category": "Hospital",
			"lga":      "Otukpo",
		},
		{
			"id":       2,
			"name":     "City Hotel",
			"category": "Hotel",
			"lga":      "Otukpo",
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    businesses,
	})
}
