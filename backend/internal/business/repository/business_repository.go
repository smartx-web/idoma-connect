package repository

import (
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/smartx-web/idoma-connect/backend/internal/business/model"
)

type BusinessRepository struct {
	DB *pgxpool.Pool
}

func NewBusinessRepository(db *pgxpool.Pool) *BusinessRepository {
	return &BusinessRepository{
		DB: db,
	}
}

// GetBusinesses returns only approved businesses.
// This is used by the public directory.
func (r *BusinessRepository) GetBusinesses(
	ctx context.Context,
	lga string,
	category string,
	search string,
) ([]model.Business, error) {

	query := `
		SELECT
			id,
			name,
			description,
			category,
			lga,
			address,
			phone,
			whatsapp,
			COALESCE(image_url, ''),
			COALESCE(video_url, ''),
			latitude,
			longitude,
			verified,
			status,
			created_at,
			updated_at
		FROM businesses
		WHERE status = 'approved'
	`

	args := []interface{}{}
	argPosition := 1

	if lga != "" {
		query += fmt.Sprintf(" AND lga = $%d", argPosition)
		args = append(args, lga)
		argPosition++
	}

	if category != "" {
		query += fmt.Sprintf(" AND category = $%d", argPosition)
		args = append(args, category)
		argPosition++
	}

	if search != "" {
		query += fmt.Sprintf(
			" AND (name ILIKE $%d OR description ILIKE $%d)",
			argPosition,
			argPosition,
		)
		args = append(args, "%"+search+"%")
		argPosition++
	}

	query += " ORDER BY created_at DESC"

	rows, err := r.DB.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	businesses := make([]model.Business, 0)

	for rows.Next() {
		var business model.Business

		err := rows.Scan(
			&business.ID,
			&business.Name,
			&business.Description,
			&business.Category,
			&business.LGA,
			&business.Address,
			&business.Phone,
			&business.WhatsApp,
			&business.ImageURL,
			&business.VideoURL,
			&business.Latitude,
			&business.Longitude,
			&business.Verified,
			&business.Status,
			&business.CreatedAt,
			&business.UpdatedAt,
		)

		if err != nil {
			return nil, err
		}

		businesses = append(businesses, business)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return businesses, nil
}

// GetBusinessByID returns a single business by ID.
func (r *BusinessRepository) GetBusinessByID(
	ctx context.Context,
	id uint,
) (*model.Business, error) {

	query := `
		SELECT
			id,
			name,
			description,
			category,
			lga,
			address,
			phone,
			whatsapp,
			COALESCE(image_url, ''),
			COALESCE(video_url, ''),
			latitude,
			longitude,
			verified,
			status,
			created_at,
			updated_at
		FROM businesses
		WHERE id = $1
  AND status = 'approved'
	`

	var business model.Business

	err := r.DB.QueryRow(
		ctx,
		query,
		id,
	).Scan(
		&business.ID,
		&business.Name,
		&business.Description,
		&business.Category,
		&business.LGA,
		&business.Address,
		&business.Phone,
		&business.WhatsApp,
		&business.ImageURL,
		&business.VideoURL,
		&business.Latitude,
		&business.Longitude,
		&business.Verified,
		&business.Status,
		&business.CreatedAt,
		&business.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &business, nil
}

// CreateBusiness creates a new business as pending.
// New submissions must be reviewed by an admin.
func (r *BusinessRepository) CreateBusiness(
	ctx context.Context,
	business model.Business,
) (*model.Business, error) {

	query := `
		INSERT INTO businesses (
			name,
			description,
			category,
			lga,
			address,
			phone,
			whatsapp,
			image_url,
			video_url,
			latitude,
			longitude,
			verified,
			status
		)
		VALUES (
			$1,
			$2,
			$3,
			$4,
			$5,
			$6,
			$7,
			$8,
			$9,
			$10,
			$11,
			FALSE,
			'pending'
		)
		RETURNING
			id,
			name,
			description,
			category,
			lga,
			address,
			phone,
			whatsapp,
			COALESCE(image_url, ''),
			COALESCE(video_url, ''),
			latitude,
			longitude,
			verified,
			status,
			created_at,
			updated_at
	`

	var created model.Business

	err := r.DB.QueryRow(
		ctx,
		query,
		business.Name,
		business.Description,
		business.Category,
		business.LGA,
		business.Address,
		business.Phone,
		business.WhatsApp,
		business.ImageURL,
		business.VideoURL,
		business.Latitude,
		business.Longitude,
	).Scan(
		&created.ID,
		&created.Name,
		&created.Description,
		&created.Category,
		&created.LGA,
		&created.Address,
		&created.Phone,
		&created.WhatsApp,
		&created.ImageURL,
		&created.VideoURL,
		&created.Latitude,
		&created.Longitude,
		&created.Verified,
		&created.Status,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &created, nil
}

// GetBusinessesByStatus returns businesses with a specific status.
// This is mainly used by the admin area.
func (r *BusinessRepository) GetBusinessesByStatus(
	ctx context.Context,
	status string,
) ([]model.Business, error) {

	query := `
		SELECT
			id,
			name,
			description,
			category,
			lga,
			address,
			phone,
			whatsapp,
			COALESCE(image_url, ''),
			COALESCE(video_url, ''),
			latitude,
			longitude,
			verified,
			status,
			created_at,
			updated_at
		FROM businesses
		WHERE status = $1
		ORDER BY created_at DESC
	`

	rows, err := r.DB.Query(ctx, query, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	businesses := make([]model.Business, 0)

	for rows.Next() {
		var business model.Business

		err := rows.Scan(
			&business.ID,
			&business.Name,
			&business.Description,
			&business.Category,
			&business.LGA,
			&business.Address,
			&business.Phone,
			&business.WhatsApp,
			&business.ImageURL,
			&business.VideoURL,
			&business.Latitude,
			&business.Longitude,
			&business.Verified,
			&business.Status,
			&business.CreatedAt,
			&business.UpdatedAt,
		)

		if err != nil {
			return nil, err
		}

		businesses = append(businesses, business)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return businesses, nil
}

// UpdateBusinessStatus changes a business status.
// Approved businesses are automatically marked as verified.
func (r *BusinessRepository) UpdateBusinessStatus(
	ctx context.Context,
	id uint,
	status string,
) (*model.Business, error) {

	verified := status == "approved"

	query := `
		UPDATE businesses
		SET
			status = $1,
			verified = $2,
			updated_at = NOW()
		WHERE id = $3
		RETURNING
			id,
			name,
			description,
			category,
			lga,
			address,
			phone,
			whatsapp,
			COALESCE(image_url, ''),
			COALESCE(video_url, ''),
			latitude,
			longitude,
			verified,
			status,
			created_at,
			updated_at
	`

	var business model.Business

	err := r.DB.QueryRow(
		ctx,
		query,
		status,
		verified,
		id,
	).Scan(
		&business.ID,
		&business.Name,
		&business.Description,
		&business.Category,
		&business.LGA,
		&business.Address,
		&business.Phone,
		&business.WhatsApp,
		&business.ImageURL,
		&business.VideoURL,
		&business.Latitude,
		&business.Longitude,
		&business.Verified,
		&business.Status,
		&business.CreatedAt,
		&business.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &business, nil
}

// Keep strings imported for future repository search helpers.
var _ = strings.TrimSpace
