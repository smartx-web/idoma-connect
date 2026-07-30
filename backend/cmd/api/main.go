package main

import (
	"log"

	"github.com/smartx-web/idoma-connect/backend/internal/router"
)

func main() {
	r := router.SetupRouter()

	log.Println("🚀 IDOMA CONNECT API running on :8080")

	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
