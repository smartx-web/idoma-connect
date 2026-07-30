package model

import "time"

type Business struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	LGA         string    `json:"lga"`
	Address     string    `json:"address"`
	Phone       string    `json:"phone"`
	WhatsApp    string    `json:"whatsapp"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
