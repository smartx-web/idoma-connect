package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/smartx-web/idoma-connect/backend/internal/sound/model"
)

type SongRepository struct {
	db *pgxpool.Pool
}

func NewSongRepository(db *pgxpool.Pool) *SongRepository {
	return &SongRepository{db: db}
}

func (r *SongRepository) GetApproved(ctx context.Context) ([]model.SoundSong, error) {
	rows, err := r.db.Query(ctx, `
		SELECT
			s.id,
			s.artist_id,
			s.album_id,
			s.category_id,
			s.title,
			s.description,
			s.audio_url,
			s.cover_image_url,
			s.duration_seconds,
			s.release_date,
			s.featured,
			s.status,
			s.play_count,
			s.created_at,
			s.updated_at
		FROM sound_songs s
		JOIN sound_artists a ON a.id = s.artist_id
		WHERE s.status = 'approved'
		  AND a.status = 'approved'
		ORDER BY s.created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var songs []model.SoundSong

	for rows.Next() {
		var song model.SoundSong

		err := rows.Scan(
			&song.ID,
			&song.ArtistID,
			&song.AlbumID,
			&song.CategoryID,
			&song.Title,
			&song.Description,
			&song.AudioURL,
			&song.CoverImageURL,
			&song.DurationSeconds,
			&song.ReleaseDate,
			&song.Featured,
			&song.Status,
			&song.PlayCount,
			&song.CreatedAt,
			&song.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		songs = append(songs, song)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return songs, nil
}

func (r *SongRepository) GetFeatured(ctx context.Context) ([]model.SoundSong, error) {
	rows, err := r.db.Query(ctx, `
		SELECT
			s.id,
			s.artist_id,
			s.album_id,
			s.category_id,
			s.title,
			s.description,
			s.audio_url,
			s.cover_image_url,
			s.duration_seconds,
			s.release_date,
			s.featured,
			s.status,
			s.play_count,
			s.created_at,
			s.updated_at
		FROM sound_songs s
		JOIN sound_artists a ON a.id = s.artist_id
		WHERE s.status = 'approved'
		  AND s.featured = TRUE
		  AND a.status = 'approved'
		ORDER BY s.created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var songs []model.SoundSong

	for rows.Next() {
		var song model.SoundSong

		err := rows.Scan(
			&song.ID,
			&song.ArtistID,
			&song.AlbumID,
			&song.CategoryID,
			&song.Title,
			&song.Description,
			&song.AudioURL,
			&song.CoverImageURL,
			&song.DurationSeconds,
			&song.ReleaseDate,
			&song.Featured,
			&song.Status,
			&song.PlayCount,
			&song.CreatedAt,
			&song.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		songs = append(songs, song)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return songs, nil
}

func (r *SongRepository) GetByID(
	ctx context.Context,
	id uint,
) (*model.SoundSong, error) {
	var song model.SoundSong

	err := r.db.QueryRow(ctx, `
		SELECT
			s.id,
			s.artist_id,
			s.album_id,
			s.category_id,
			s.title,
			s.description,
			s.audio_url,
			s.cover_image_url,
			s.duration_seconds,
			s.release_date,
			s.featured,
			s.status,
			s.play_count,
			s.created_at,
			s.updated_at
		FROM sound_songs s
		JOIN sound_artists a ON a.id = s.artist_id
		WHERE s.id = $1
		  AND s.status = 'approved'
		  AND a.status = 'approved'
	`, id).Scan(
		&song.ID,
		&song.ArtistID,
		&song.AlbumID,
		&song.CategoryID,
		&song.Title,
		&song.Description,
		&song.AudioURL,
		&song.CoverImageURL,
		&song.DurationSeconds,
		&song.ReleaseDate,
		&song.Featured,
		&song.Status,
		&song.PlayCount,
		&song.CreatedAt,
		&song.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &song, nil
}

func (r *SongRepository) GetByCategory(
	ctx context.Context,
	categoryID uint,
) ([]model.SoundSong, error) {
	rows, err := r.db.Query(ctx, `
		SELECT
			s.id,
			s.artist_id,
			s.album_id,
			s.category_id,
			s.title,
			s.description,
			s.audio_url,
			s.cover_image_url,
			s.duration_seconds,
			s.release_date,
			s.featured,
			s.status,
			s.play_count,
			s.created_at,
			s.updated_at
		FROM sound_songs s
		JOIN sound_artists a ON a.id = s.artist_id
		WHERE s.category_id = $1
		  AND s.status = 'approved'
		  AND a.status = 'approved'
		ORDER BY s.created_at DESC
	`, categoryID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var songs []model.SoundSong

	for rows.Next() {
		var song model.SoundSong

		err := rows.Scan(
			&song.ID,
			&song.ArtistID,
			&song.AlbumID,
			&song.CategoryID,
			&song.Title,
			&song.Description,
			&song.AudioURL,
			&song.CoverImageURL,
			&song.DurationSeconds,
			&song.ReleaseDate,
			&song.Featured,
			&song.Status,
			&song.PlayCount,
			&song.CreatedAt,
			&song.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		songs = append(songs, song)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return songs, nil
}

func (r *SongRepository) Create(
	ctx context.Context,
	song *model.SoundSong,
) error {
	return r.db.QueryRow(ctx, `
		INSERT INTO sound_songs (
			artist_id,
			album_id,
			category_id,
			title,
			description,
			audio_url,
			cover_image_url,
			duration_seconds,
			release_date,
			featured,
			status
		)
		VALUES (
			$1, $2, $3, $4, $5,
			$6, $7, $8, $9, FALSE, 'pending'
		)
		RETURNING
			id,
			play_count,
			created_at,
			updated_at
	`,
		song.ArtistID,
		song.AlbumID,
		song.CategoryID,
		song.Title,
		song.Description,
		song.AudioURL,
		song.CoverImageURL,
		song.DurationSeconds,
		song.ReleaseDate,
	).Scan(
		&song.ID,
		&song.PlayCount,
		&song.CreatedAt,
		&song.UpdatedAt,
	)
}

func (r *SongRepository) UpdateStatus(
	ctx context.Context,
	id uint,
	status string,
) error {
	_, err := r.db.Exec(ctx, `
		UPDATE sound_songs
		SET
			status = $1,
			updated_at = NOW()
		WHERE id = $2
	`, status, id)

	return err
}

func (r *SongRepository) IncrementPlayCount(
	ctx context.Context,
	id uint,
) error {
	_, err := r.db.Exec(ctx, `
		UPDATE sound_songs
		SET
			play_count = play_count + 1,
			updated_at = NOW()
		WHERE id = $1
		  AND status = 'approved'
	`, id)

	return err
}
