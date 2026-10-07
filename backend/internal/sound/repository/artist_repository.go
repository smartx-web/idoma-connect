package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/smartx-web/idoma-connect/backend/internal/sound/model"
)

type ArtistRepository struct {
	db *pgxpool.Pool
}

func NewArtistRepository(db *pgxpool.Pool) *ArtistRepository {
	return &ArtistRepository{db: db}
}

func (r *ArtistRepository) GetApproved(ctx context.Context) ([]model.SoundArtist, error) {
	rows, err := r.db.Query(ctx, `
		SELECT
			id,
			name,
			stage_name,
			biography,
			lga,
			community,
			image_url,
			facebook_url,
			instagram_url,
			youtube_url,
			website_url,
			verified,
			status,
			created_at,
			updated_at
		FROM sound_artists
		WHERE status = 'approved'
		ORDER BY name ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var artists []model.SoundArtist

	for rows.Next() {
		var artist model.SoundArtist

		err := rows.Scan(
			&artist.ID,
			&artist.Name,
			&artist.StageName,
			&artist.Biography,
			&artist.LGA,
			&artist.Community,
			&artist.ImageURL,
			&artist.FacebookURL,
			&artist.InstagramURL,
			&artist.YouTubeURL,
			&artist.WebsiteURL,
			&artist.Verified,
			&artist.Status,
			&artist.CreatedAt,
			&artist.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		artists = append(artists, artist)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return artists, nil
}

func (r *ArtistRepository) GetAll(ctx context.Context) ([]model.SoundArtist, error) {
	rows, err := r.db.Query(ctx, `
		SELECT
			id,
			name,
			stage_name,
			biography,
			lga,
			community,
			image_url,
			facebook_url,
			instagram_url,
			youtube_url,
			website_url,
			verified,
			status,
			created_at,
			updated_at
		FROM sound_artists
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var artists []model.SoundArtist

	for rows.Next() {
		var artist model.SoundArtist

		err := rows.Scan(
			&artist.ID,
			&artist.Name,
			&artist.StageName,
			&artist.Biography,
			&artist.LGA,
			&artist.Community,
			&artist.ImageURL,
			&artist.FacebookURL,
			&artist.InstagramURL,
			&artist.YouTubeURL,
			&artist.WebsiteURL,
			&artist.Verified,
			&artist.Status,
			&artist.CreatedAt,
			&artist.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		artists = append(artists, artist)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return artists, nil
}

func (r *ArtistRepository) GetByID(ctx context.Context, id uint) (*model.SoundArtist, error) {
	var artist model.SoundArtist

	err := r.db.QueryRow(ctx, `
		SELECT
			id,
			name,
			stage_name,
			biography,
			lga,
			community,
			image_url,
			facebook_url,
			instagram_url,
			youtube_url,
			website_url,
			verified,
			status,
			created_at,
			updated_at
		FROM sound_artists
		WHERE id = $1
	`, id).Scan(
		&artist.ID,
		&artist.Name,
		&artist.StageName,
		&artist.Biography,
		&artist.LGA,
		&artist.Community,
		&artist.ImageURL,
		&artist.FacebookURL,
		&artist.InstagramURL,
		&artist.YouTubeURL,
		&artist.WebsiteURL,
		&artist.Verified,
		&artist.Status,
		&artist.CreatedAt,
		&artist.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &artist, nil
}

func (r *ArtistRepository) Create(ctx context.Context, artist *model.SoundArtist) error {
	return r.db.QueryRow(ctx, `
		INSERT INTO sound_artists (
			name,
			stage_name,
			biography,
			lga,
			community,
			image_url,
			facebook_url,
			instagram_url,
			youtube_url,
			website_url,
			verified,
			status
		)
		VALUES (
			$1, $2, $3, $4, $5,
			$6, $7, $8, $9, $10,
			FALSE,
			'pending'
		)
		RETURNING
			id,
			created_at,
			updated_at
	`,
		artist.Name,
		artist.StageName,
		artist.Biography,
		artist.LGA,
		artist.Community,
		artist.ImageURL,
		artist.FacebookURL,
		artist.InstagramURL,
		artist.YouTubeURL,
		artist.WebsiteURL,
	).Scan(
		&artist.ID,
		&artist.CreatedAt,
		&artist.UpdatedAt,
	)
}

func (r *ArtistRepository) UpdateStatus(
	ctx context.Context,
	id uint,
	status string,
) error {
	_, err := r.db.Exec(ctx, `
		UPDATE sound_artists
		SET
			status = $1,
			updated_at = NOW()
		WHERE id = $2
	`, status, id)

	return err
}
