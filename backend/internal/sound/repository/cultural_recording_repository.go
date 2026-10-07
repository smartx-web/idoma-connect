package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/smartx-web/idoma-connect/backend/internal/sound/model"
)

type CulturalRecordingRepository struct {
	db *pgxpool.Pool
}

func NewCulturalRecordingRepository(db *pgxpool.Pool) *CulturalRecordingRepository {
	return &CulturalRecordingRepository{db: db}
}

func (r *CulturalRecordingRepository) GetPublished(
	ctx context.Context,
) ([]model.CulturalRecording, error) {
	rows, err := r.db.Query(ctx, `
		SELECT
			id,
			title,
			description,
			recording_type,
			contributor_name,
			lga,
			community,
			category_id,
			audio_url,
			image_url,
			recorded_date,
			published,
			created_at,
			updated_at
		FROM cultural_recordings
		WHERE published = TRUE
		ORDER BY recorded_date DESC NULLS LAST, created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var recordings []model.CulturalRecording

	for rows.Next() {
		var recording model.CulturalRecording

		err := rows.Scan(
			&recording.ID,
			&recording.Title,
			&recording.Description,
			&recording.RecordingType,
			&recording.ContributorName,
			&recording.LGA,
			&recording.Community,
			&recording.CategoryID,
			&recording.AudioURL,
			&recording.ImageURL,
			&recording.RecordedDate,
			&recording.Published,
			&recording.CreatedAt,
			&recording.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		recordings = append(recordings, recording)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return recordings, nil
}

func (r *CulturalRecordingRepository) GetAll(
	ctx context.Context,
) ([]model.CulturalRecording, error) {
	rows, err := r.db.Query(ctx, `
		SELECT
			id,
			title,
			description,
			recording_type,
			contributor_name,
			lga,
			community,
			category_id,
			audio_url,
			image_url,
			recorded_date,
			published,
			created_at,
			updated_at
		FROM cultural_recordings
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var recordings []model.CulturalRecording

	for rows.Next() {
		var recording model.CulturalRecording

		err := rows.Scan(
			&recording.ID,
			&recording.Title,
			&recording.Description,
			&recording.RecordingType,
			&recording.ContributorName,
			&recording.LGA,
			&recording.Community,
			&recording.CategoryID,
			&recording.AudioURL,
			&recording.ImageURL,
			&recording.RecordedDate,
			&recording.Published,
			&recording.CreatedAt,
			&recording.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		recordings = append(recordings, recording)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return recordings, nil
}

func (r *CulturalRecordingRepository) Create(
	ctx context.Context,
	recording *model.CulturalRecording,
) error {
	return r.db.QueryRow(ctx, `
		INSERT INTO cultural_recordings (
			title,
			description,
			recording_type,
			contributor_name,
			lga,
			community,
			category_id,
			audio_url,
			image_url,
			recorded_date,
			published
		)
		VALUES (
			$1, $2, $3, $4, $5,
			$6, $7, $8, $9, $10, FALSE
		)
		RETURNING
			id,
			published,
			created_at,
			updated_at
	`,
		recording.Title,
		recording.Description,
		recording.RecordingType,
		recording.ContributorName,
		recording.LGA,
		recording.Community,
		recording.CategoryID,
		recording.AudioURL,
		recording.ImageURL,
		recording.RecordedDate,
	).Scan(
		&recording.ID,
		&recording.Published,
		&recording.CreatedAt,
		&recording.UpdatedAt,
	)
}

func (r *CulturalRecordingRepository) UpdatePublished(
	ctx context.Context,
	id uint,
	published bool,
) error {
	_, err := r.db.Exec(ctx, `
		UPDATE cultural_recordings
		SET
			published = $1,
			updated_at = NOW()
		WHERE id = $2
	`, published, id)

	return err
}
