package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/smartx-web/idoma-connect/backend/internal/premium/model"
)

type PremiumRepository struct {
	DB *pgxpool.Pool
}

func NewPremiumRepository(db *pgxpool.Pool) *PremiumRepository {
	return &PremiumRepository{DB: db}
}

// GetAll returns all premium listings.
func (r *PremiumRepository) GetAll(
	ctx context.Context,
) ([]model.PremiumListing, error) {

	query := `
		SELECT
			p.id,
			p.business_id,
			b.name,
			b.category,
			b.lga,
			p.title,
			COALESCE(p.description, ''),
			COALESCE(p.image_url, ''),
			p.start_date,
			p.end_date,
			p.active,
			p.created_at,
			p.updated_at
		FROM premium_listings p
		JOIN businesses b
			ON b.id = p.business_id
		ORDER BY p.created_at DESC
	`

	rows, err := r.DB.Query(ctx, query)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	listings :=
		make([]model.PremiumListing, 0)

	for rows.Next() {

		var listing model.PremiumListing

		err := rows.Scan(
			&listing.ID,
			&listing.BusinessID,
			&listing.BusinessName,
			&listing.Category,
			&listing.LGA,
			&listing.Title,
			&listing.Description,
			&listing.ImageURL,
			&listing.StartDate,
			&listing.EndDate,
			&listing.Active,
			&listing.CreatedAt,
			&listing.UpdatedAt,
		)

		if err != nil {
			return nil, err
		}

		listings =
			append(listings, listing)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return listings, nil
}

// GetActive returns currently active
// premium listings belonging to approved businesses.
func (r *PremiumRepository) GetActive(
	ctx context.Context,
) ([]model.PremiumListing, error) {

	query := `
		SELECT
			p.id,
			p.business_id,
			b.name,
			b.category,
			b.lga,
			p.title,
			COALESCE(p.description, ''),
			COALESCE(p.image_url, ''),
			p.start_date,
			p.end_date,
			p.active,
			p.created_at,
			p.updated_at
		FROM premium_listings p
		JOIN businesses b
			ON b.id = p.business_id
		WHERE p.active = TRUE
		  AND b.status = 'approved'
		  AND (
			  p.start_date IS NULL
			  OR p.start_date <= NOW()
		  )
		  AND (
			  p.end_date IS NULL
			  OR p.end_date >= NOW()
		  )
		ORDER BY p.created_at DESC
	`

	rows, err := r.DB.Query(ctx, query)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	listings :=
		make([]model.PremiumListing, 0)

	for rows.Next() {

		var listing model.PremiumListing

		err := rows.Scan(
			&listing.ID,
			&listing.BusinessID,
			&listing.BusinessName,
			&listing.Category,
			&listing.LGA,
			&listing.Title,
			&listing.Description,
			&listing.ImageURL,
			&listing.StartDate,
			&listing.EndDate,
			&listing.Active,
			&listing.CreatedAt,
			&listing.UpdatedAt,
		)

		if err != nil {
			return nil, err
		}

		listings =
			append(listings, listing)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return listings, nil
}

// Create creates a premium listing
// for an approved business.
func (r *PremiumRepository) Create(
	ctx context.Context,
	listing *model.PremiumListing,
) (*model.PremiumListing, error) {

	var businessExists bool

	checkQuery := `
		SELECT EXISTS (
			SELECT 1
			FROM businesses
			WHERE id = $1
			  AND status = 'approved'
		)
	`

	err := r.DB.QueryRow(
		ctx,
		checkQuery,
		listing.BusinessID,
	).Scan(&businessExists)

	if err != nil {
		return nil, err
	}

	if !businessExists {

		return nil, fmt.Errorf(
			"business must be approved before it can be promoted",
		)
	}

	query := `
		INSERT INTO premium_listings (
			business_id,
			title,
			description,
			image_url,
			start_date,
			end_date,
			active
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING
			id,
			business_id,
			title,
			COALESCE(description, ''),
			COALESCE(image_url, ''),
			start_date,
			end_date,
			active,
			created_at,
			updated_at
	`

	var created model.PremiumListing

	err = r.DB.QueryRow(
		ctx,
		query,
		listing.BusinessID,
		listing.Title,
		listing.Description,
		listing.ImageURL,
		listing.StartDate,
		listing.EndDate,
		listing.Active,
	).Scan(
		&created.ID,
		&created.BusinessID,
		&created.Title,
		&created.Description,
		&created.ImageURL,
		&created.StartDate,
		&created.EndDate,
		&created.Active,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &created, nil
}

// UpdateStatus changes the active status
// of a premium listing.
func (r *PremiumRepository) UpdateStatus(
	ctx context.Context,
	id uint,
	active bool,
) (*model.PremiumListing, error) {

	query := `
		UPDATE premium_listings
		SET
			active = $1,
			updated_at = NOW()
		WHERE id = $2
		RETURNING
			id,
			business_id,
			title,
			COALESCE(description, ''),
			COALESCE(image_url, ''),
			start_date,
			end_date,
			active,
			created_at,
			updated_at
	`

	var listing model.PremiumListing

	err := r.DB.QueryRow(
		ctx,
		query,
		active,
		id,
	).Scan(
		&listing.ID,
		&listing.BusinessID,
		&listing.Title,
		&listing.Description,
		&listing.ImageURL,
		&listing.StartDate,
		&listing.EndDate,
		&listing.Active,
		&listing.CreatedAt,
		&listing.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &listing, nil
}
