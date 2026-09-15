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
			created_at,
			updated_at
		FROM businesses
		WHERE 1=1
	`

	args := []interface{}{}
	argNumber := 1

	if strings.TrimSpace(lga) != "" {
		query += fmt.Sprintf(
			" AND LOWER(lga) = LOWER($%d)",
			argNumber,
		)

		args = append(args, lga)
		argNumber++
	}

	if strings.TrimSpace(category) != "" {
		query += fmt.Sprintf(
			" AND LOWER(category) = LOWER($%d)",
			argNumber,
		)

		args = append(args, category)
		argNumber++
	}

	if strings.TrimSpace(search) != "" {
		query += fmt.Sprintf(
			" AND (LOWER(name) LIKE LOWER($%d) OR LOWER(description) LIKE LOWER($%d))",
			argNumber,
			argNumber,
		)

		args = append(args, "%"+search+"%")
		argNumber++
	}

	query += " ORDER BY id ASC"

	rows, err := r.DB.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var businesses []model.Business

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

	if businesses == nil {
		businesses = []model.Business{}
	}

	return businesses, nil
}

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
			created_at,
			updated_at
		FROM businesses
		WHERE id = $1
	`

	var business model.Business

	err := r.DB.QueryRow(ctx, query, id).Scan(
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
		&business.CreatedAt,
		&business.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &business, nil
}

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
			verified
		)
		VALUES (
			$1, $2, $3, $4, $5, $6,
			$7, $8, $9, $10, $11, $12
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
		business.Verified,
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
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &created, nil
}
