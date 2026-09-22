package repository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/smartx-web/idoma-connect/backend/internal/happening/model"
)

type HappeningRepository struct {
	DB *pgxpool.Pool
}

func NewHappeningRepository(db *pgxpool.Pool) *HappeningRepository {
	return &HappeningRepository{
		DB: db,
	}
}

/* =========================
   PUBLIC HAPPENINGS
========================= */

func (r *HappeningRepository) GetAll() ([]model.Happening, error) {

	query := `
		SELECT
			id,
			title,
			description,
			image_url,
			location,
			event_date,
			category,
			published,
			created_at,
			updated_at
		FROM happenings
		WHERE published = TRUE
		ORDER BY event_date DESC NULLS LAST, created_at DESC
	`

	rows, err := r.DB.Query(
		context.Background(),
		query,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	happenings := make([]model.Happening, 0)

	for rows.Next() {

		var happening model.Happening

		err := rows.Scan(
			&happening.ID,
			&happening.Title,
			&happening.Description,
			&happening.ImageURL,
			&happening.Location,
			&happening.EventDate,
			&happening.Category,
			&happening.Published,
			&happening.CreatedAt,
			&happening.UpdatedAt,
		)

		if err != nil {
			return nil, err
		}

		happenings = append(
			happenings,
			happening,
		)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return happenings, nil
}

/* =========================
   ADMIN — ALL HAPPENINGS
========================= */

func (r *HappeningRepository) GetAllAdmin() ([]model.Happening, error) {

	query := `
		SELECT
			id,
			title,
			description,
			image_url,
			location,
			event_date,
			category,
			published,
			created_at,
			updated_at
		FROM happenings
		ORDER BY event_date DESC NULLS LAST, created_at DESC
	`

	rows, err := r.DB.Query(
		context.Background(),
		query,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	happenings := make([]model.Happening, 0)

	for rows.Next() {

		var happening model.Happening

		err := rows.Scan(
			&happening.ID,
			&happening.Title,
			&happening.Description,
			&happening.ImageURL,
			&happening.Location,
			&happening.EventDate,
			&happening.Category,
			&happening.Published,
			&happening.CreatedAt,
			&happening.UpdatedAt,
		)

		if err != nil {
			return nil, err
		}

		happenings = append(
			happenings,
			happening,
		)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return happenings, nil
}
func (r *HappeningRepository) UpdatePublished(
	id int64,
	published bool,
) error {

	query := `
		UPDATE happenings
		SET
			published = $1,
			updated_at = NOW()
		WHERE id = $2
	`

	commandTag, err := r.DB.Exec(
		context.Background(),
		query,
		published,
		id,
	)

	if err != nil {
		return err
	}

	if commandTag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}

	return nil
}

/* =========================
   CREATE HAPPENING
========================= */

func (r *HappeningRepository) Create(
	h *model.Happening,
) error {

	query := `
		INSERT INTO happenings (
			title,
			description,
			image_url,
			location,
			event_date,
			category,
			published
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at
	`

	return r.DB.QueryRow(
		context.Background(),
		query,
		h.Title,
		h.Description,
		h.ImageURL,
		h.Location,
		h.EventDate,
		h.Category,
		h.Published,
	).Scan(
		&h.ID,
		&h.CreatedAt,
		&h.UpdatedAt,
	)
}
