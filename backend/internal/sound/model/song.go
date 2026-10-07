package model

import "time"

type SoundSong struct {
	ID              uint       `json:"id"`
	ArtistID        uint       `json:"artist_id"`
	AlbumID         *uint      `json:"album_id"`
	CategoryID      *uint      `json:"category_id"`
	Title           string     `json:"title"`
	Description     string     `json:"description"`
	AudioURL        string     `json:"audio_url"`
	CoverImageURL   string     `json:"cover_image_url"`
	DurationSeconds *int       `json:"duration_seconds"`
	ReleaseDate     *time.Time `json:"release_date"`
	Featured        bool       `json:"featured"`
	Status          string     `json:"status"`
	PlayCount       int64      `json:"play_count"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
