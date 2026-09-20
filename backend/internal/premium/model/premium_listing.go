package model

import "time"

type PremiumListing struct {
	ID           uint       `json:"id"`
	BusinessID   uint       `json:"business_id"`
	BusinessName string     `json:"business_name"`
	Category     string     `json:"category"`
	LGA          string     `json:"lga"`
	Title        string     `json:"title"`
	Description  string     `json:"description"`
	ImageURL     string     `json:"image_url"`
	StartDate    *time.Time `json:"start_date"`
	EndDate      *time.Time `json:"end_date"`
	Active       bool       `json:"active"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}
