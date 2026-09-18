package model

import "time"

type Happening struct {
	ID          uint       `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	ImageURL    string     `json:"image_url"`
	Location    string     `json:"location"`
	EventDate   *time.Time `json:"event_date"`
	Category    string     `json:"category"`
	Published   bool       `json:"published"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
