package model

import "time"

type SoundAlbum struct {
	ID            uint       `json:"id"`
	ArtistID      uint       `json:"artist_id"`
	Title         string     `json:"title"`
	Description   string     `json:"description"`
	CoverImageURL string     `json:"cover_image_url"`
	ReleaseDate   *time.Time `json:"release_date"`
	AlbumType     string     `json:"album_type"`
	Status        string     `json:"status"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
