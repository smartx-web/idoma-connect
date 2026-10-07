package model

import "time"

type SoundSubmission struct {
	ID             uint   `json:"id"`
	SubmitterName  string `json:"submitter_name"`
	SubmitterEmail string `json:"submitter_email"`
	SubmitterPhone string `json:"submitter_phone"`
	ArtistName     string `json:"artist_name"`
	Title          string `json:"title"`
	Description    string `json:"description"`
	CategoryID     *uint  `json:"category_id"`
	AudioURL       string `json:"audio_url"`
	CoverImageURL  string `json:"cover_image_url"`
	SubmissionType string `json:"submission_type"`
	Status         string `json:"status"`
	AdminNotes     string `json:"admin_notes"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
