package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/smartx-web/idoma-connect/backend/internal/sound/repository"
)

type CategoryController struct {
	repo *repository.CategoryRepository
}

func NewCategoryController(repo *repository.CategoryRepository) *CategoryController {
	return &CategoryController{repo: repo}
}

func (c *CategoryController) GetAll(ctx *gin.Context) {
	categories, err := c.repo.GetAll(ctx.Request.Context())
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch sound categories",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": categories,
	})
}

func (c *CategoryController) GetByID(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		return
	}

	category, err := c.repo.GetByID(ctx.Request.Context(), id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": "sound category not found",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": category,
	})
}
