package main

import (
	"log"

	"github.com/smartx-web/idoma-connect/backend/internal/database"
	"github.com/smartx-web/idoma-connect/backend/internal/router"
)

func main() {
	// Connect to database
	db, err := database.Connect()
	if err != nil {
		log.Fatal("❌ Database connection failed:", err)
	}
	defer db.Close()

	log.Println("✅ Connected to Neon PostgreSQL")

	// Setup router
	r := router.SetupRouter(db)

	log.Println("🚀 IDOMA CONNECT API running on :8080")

	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
