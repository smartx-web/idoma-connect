package model

import "time"

type SoundArtist struct {
	ID           uint   `json:"id"`
	Name         string `json:"name"`
	StageName    string `json:"stage_name"`
	Biography    string `json:"biography"`
	LGA          string `json:"lga"`
	Community    string `json:"community"`
	ImageURL     string `json:"image_url"`
	FacebookURL  string `json:"facebook_url"`
	InstagramURL string `json:"instagram_url"`
	YouTubeURL   string `json:"youtube_url"`
	WebsiteURL   string `json:"website_url"`
	Verified     bool   `json:"verified"`
	Status       string `json:"status"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
