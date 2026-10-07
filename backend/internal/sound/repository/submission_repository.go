package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/smartx-web/idoma-connect/backend/internal/sound/model"
)

type SubmissionRepository struct {
	db *pgxpool.Pool
}

func NewSubmissionRepository(db *pgxpool.Pool) *SubmissionRepository {
	return &SubmissionRepository{db: db}
}

func (r *SubmissionRepository) Create(
	ctx context.Context,
	submission *model.SoundSubmission,
) error {
	return r.db.QueryRow(ctx, `
		INSERT INTO sound_submissions (
			submitter_name,
			submitter_email,
			submitter_phone,
			artist_name,
			title,
			description,
			category_id,
			audio_url,
			cover_image_url,
			submission_type,
			status
		)
		VALUES (
			$1, $2, $3, $4, $5,
			$6, $7, $8, $9, $10, 'pending'
		)
		RETURNING
			id,
			status,
			created_at,
			updated_at
	`,
		submission.SubmitterName,
		submission.SubmitterEmail,
		submission.SubmitterPhone,
		submission.ArtistName,
		submission.Title,
		submission.Description,
		submission.CategoryID,
		submission.AudioURL,
		submission.CoverImageURL,
		submission.SubmissionType,
	).Scan(
		&submission.ID,
		&submission.Status,
		&submission.CreatedAt,
		&submission.UpdatedAt,
	)
}

func (r *SubmissionRepository) GetAll(
	ctx context.Context,
) ([]model.SoundSubmission, error) {
	rows, err := r.db.Query(ctx, `
		SELECT
			id,
			submitter_name,
			submitter_email,
			submitter_phone,
			artist_name,
			title,
			description,
			category_id,
			audio_url,
			cover_image_url,
			submission_type,
			status,
			admin_notes,
			created_at,
			updated_at
		FROM sound_submissions
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var submissions []model.SoundSubmission

	for rows.Next() {
		var submission model.SoundSubmission

		err := rows.Scan(
			&submission.ID,
			&submission.SubmitterName,
			&submission.SubmitterEmail,
			&submission.SubmitterPhone,
			&submission.ArtistName,
			&submission.Title,
			&submission.Description,
			&submission.CategoryID,
			&submission.AudioURL,
			&submission.CoverImageURL,
			&submission.SubmissionType,
			&submission.Status,
			&submission.AdminNotes,
			&submission.CreatedAt,
			&submission.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		submissions = append(submissions, submission)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return submissions, nil
}

func (r *SubmissionRepository) GetByStatus(
	ctx context.Context,
	status string,
) ([]model.SoundSubmission, error) {
	rows, err := r.db.Query(ctx, `
		SELECT
			id,
			submitter_name,
			submitter_email,
			submitter_phone,
			artist_name,
			title,
			description,
			category_id,
			audio_url,
			cover_image_url,
			submission_type,
			status,
			admin_notes,
			created_at,
			updated_at
		FROM sound_submissions
		WHERE status = $1
		ORDER BY created_at DESC
	`, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var submissions []model.SoundSubmission

	for rows.Next() {
		var submission model.SoundSubmission

		err := rows.Scan(
			&submission.ID,
			&submission.SubmitterName,
			&submission.SubmitterEmail,
			&submission.SubmitterPhone,
			&submission.ArtistName,
			&submission.Title,
			&submission.Description,
			&submission.CategoryID,
			&submission.AudioURL,
			&submission.CoverImageURL,
			&submission.SubmissionType,
			&submission.Status,
			&submission.AdminNotes,
			&submission.CreatedAt,
			&submission.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		submissions = append(submissions, submission)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return submissions, nil
}

func (r *SubmissionRepository) UpdateStatus(
	ctx context.Context,
	id uint,
	status string,
	adminNotes string,
) error {
	_, err := r.db.Exec(ctx, `
		UPDATE sound_submissions
		SET
			status = $1,
			admin_notes = $2,
			updated_at = NOW()
		WHERE id = $3
	`, status, adminNotes, id)

	return err
}
