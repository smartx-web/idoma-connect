package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/smartx-web/idoma-connect/backend/internal/sound/model"
)

type CategoryRepository struct {
	db *pgxpool.Pool
}

func NewCategoryRepository(db *pgxpool.Pool) *CategoryRepository {
	return &CategoryRepository{db: db}
}

func (r *CategoryRepository) GetAll(ctx context.Context) ([]model.SoundCategory, error) {
	rows, err := r.db.Query(ctx, `
		SELECT
			id,
			name,
			slug,
			description,
			created_at,
			updated_at
		FROM sound_categories
		ORDER BY name ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []model.SoundCategory

	for rows.Next() {
		var category model.SoundCategory

		err := rows.Scan(
			&category.ID,
			&category.Name,
			&category.Slug,
			&category.Description,
			&category.CreatedAt,
			&category.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		categories = append(categories, category)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return categories, nil
}

func (r *CategoryRepository) GetByID(ctx context.Context, id uint) (*model.SoundCategory, error) {
	var category model.SoundCategory

	err := r.db.QueryRow(ctx, `
		SELECT
			id,
			name,
			slug,
			description,
			created_at,
			updated_at
		FROM sound_categories
		WHERE id = $1
	`, id).Scan(
		&category.ID,
		&category.Name,
		&category.Slug,
		&category.Description,
		&category.CreatedAt,
		&category.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &category, nil
}
