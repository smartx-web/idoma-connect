package main

import (
	"log"
	"os"

	"github.com/smartx-web/idoma-connect/backend/internal/database"
	"github.com/smartx-web/idoma-connect/backend/internal/router"
)

func main() {
	db, err := database.Connect()
	if err != nil {
		log.Fatal("Database connection failed:", err)
	}
	defer db.Close()

	log.Println("Connected to Neon PostgreSQL")
	r := router.SetupRouter(db)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("IDOMA CONNECT API running on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
