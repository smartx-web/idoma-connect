package main

import (
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Welcome to IDOMA CONNECT API",
			"status":  "running",
		})
	})

	log.Println("🚀 IDOMA CONNECT API running on :8080")

	router.Run(":8080")
}
