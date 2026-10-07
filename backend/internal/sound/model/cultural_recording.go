package model

import "time"

type CulturalRecording struct {
	ID              uint       `json:"id"`
	Title           string     `json:"title"`
	Description     string     `json:"description"`
	RecordingType   string     `json:"recording_type"`
	ContributorName string     `json:"contributor_name"`
	LGA             string     `json:"lga"`
	Community       string     `json:"community"`
	CategoryID      *uint      `json:"category_id"`
	AudioURL        string     `json:"audio_url"`
	ImageURL        string     `json:"image_url"`
	RecordedDate    *time.Time `json:"recorded_date"`
	Published       bool       `json:"published"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
