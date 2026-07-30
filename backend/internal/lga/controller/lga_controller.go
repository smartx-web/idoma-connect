package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetLGAs(c *gin.Context) {

	lgas := []gin.H{
		{"id": 1, "name": "Otukpo"},
		{"id": 2, "name": "Apa"},
		{"id": 3, "name": "Agatu"},
		{"id": 4, "name": "Ado"},
		{"id": 5, "name": "Ogbadibo"},
		{"id": 6, "name": "Ohimini"},
		{"id": 7, "name": "Oju"},
		{"id": 8, "name": "Okpokwu"},
		{"id": 9, "name": "Obi"},
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": lgas,
	})
}
