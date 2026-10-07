package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/smartx-web/idoma-connect/backend/internal/sound/model"
)

type AlbumRepository struct {
	db *pgxpool.Pool
}

func NewAlbumRepository(db *pgxpool.Pool) *AlbumRepository {
	return &AlbumRepository{db: db}
}

func (r *AlbumRepository) GetApproved(ctx context.Context) ([]model.SoundAlbum, error) {
	rows, err := r.db.Query(ctx, `
		SELECT
			a.id,
			a.artist_id,
			a.title,
			a.description,
			a.cover_image_url,
			a.release_date,
			a.album_type,
			a.status,
			a.created_at,
			a.updated_at
		FROM sound_albums a
		JOIN sound_artists ar ON ar.id = a.artist_id
		WHERE a.status = 'approved'
		  AND ar.status = 'approved'
		ORDER BY a.release_date DESC NULLS LAST, a.created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var albums []model.SoundAlbum

	for rows.Next() {
		var album model.SoundAlbum

		err := rows.Scan(
			&album.ID,
			&album.ArtistID,
			&album.Title,
			&album.Description,
			&album.CoverImageURL,
			&album.ReleaseDate,
			&album.AlbumType,
			&album.Status,
			&album.CreatedAt,
			&album.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		albums = append(albums, album)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return albums, nil
}

func (r *AlbumRepository) GetByArtist(
	ctx context.Context,
	artistID uint,
) ([]model.SoundAlbum, error) {
	rows, err := r.db.Query(ctx, `
		SELECT
			id,
			artist_id,
			title,
			description,
			cover_image_url,
			release_date,
			album_type,
			status,
			created_at,
			updated_at
		FROM sound_albums
		WHERE artist_id = $1
		  AND status = 'approved'
		ORDER BY release_date DESC NULLS LAST, created_at DESC
	`, artistID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var albums []model.SoundAlbum

	for rows.Next() {
		var album model.SoundAlbum

		err := rows.Scan(
			&album.ID,
			&album.ArtistID,
			&album.Title,
			&album.Description,
			&album.CoverImageURL,
			&album.ReleaseDate,
			&album.AlbumType,
			&album.Status,
			&album.CreatedAt,
			&album.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		albums = append(albums, album)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return albums, nil
}

func (r *AlbumRepository) Create(
	ctx context.Context,
	album *model.SoundAlbum,
) error {
	return r.db.QueryRow(ctx, `
		INSERT INTO sound_albums (
			artist_id,
			title,
			description,
			cover_image_url,
			release_date,
			album_type,
			status
		)
		VALUES (
			$1, $2, $3, $4, $5, $6, 'pending'
		)
		RETURNING
			id,
			created_at,
			updated_at
	`,
		album.ArtistID,
		album.Title,
		album.Description,
		album.CoverImageURL,
		album.ReleaseDate,
		album.AlbumType,
	).Scan(
		&album.ID,
		&album.CreatedAt,
		&album.UpdatedAt,
	)
}

func (r *AlbumRepository) UpdateStatus(
	ctx context.Context,
	id uint,
	status string,
) error {
	_, err := r.db.Exec(ctx, `
		UPDATE sound_albums
		SET
			status = $1,
			updated_at = NOW()
		WHERE id = $2
	`, status, id)

	return err
}
