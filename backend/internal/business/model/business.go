package model

import "time"

type Business struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Category    string `json:"category"`
	LGA         string `json:"lga"`
	Address     string `json:"address"`

	Phone    string `json:"phone"`
	WhatsApp string `json:"whatsapp"`

	ImageURL string `json:"image_url"`
	VideoURL string `json:"video_url"`

	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`

	Verified bool   `json:"verified"`
	Status   string `json:"status" db:"status"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
