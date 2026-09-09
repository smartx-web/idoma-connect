package repository

import "github.com/smartx-web/idoma-connect/backend/internal/business/model"

var Businesses = []model.Business{
	{
		ID:          1,
		Name:        "Royal Specialist Hospital",
		Description: "24-hour specialist healthcare services",
		Category:    "Hospital",
		LGA:         "Otukpo",
		Address:     "No. 12 Otukpo Road, Otukpo",
		Phone:       "07060784477",
		WhatsApp:    "07060784477",

		ImageURL:  "https://example.com/royal.jpg",
		Latitude:  7.1905,
		Longitude: 8.1347,

		Verified: true,
	},
}
