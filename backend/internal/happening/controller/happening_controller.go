package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/smartx-web/idoma-connect/backend/internal/happening/model"
	"github.com/smartx-web/idoma-connect/backend/internal/happening/repository"
)

type HappeningController struct {
	Repository *repository.HappeningRepository
}

func NewHappeningController(
	repo *repository.HappeningRepository,
) *HappeningController {
	return &HappeningController{
		Repository: repo,
	}
}

func (c *HappeningController) GetAll(ctx *gin.Context) {
	happenings, err := c.Repository.GetAll()

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch happenings",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": happenings,
	})
}
func (c *HappeningController) Create(ctx *gin.Context) {
	var happening model.Happening

	if err := ctx.ShouldBindJSON(&happening); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
		})
		return
	}

	if happening.Title == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Title is required",
		})
		return
	}

	if happening.Description == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Description is required",
		})
		return
	}

	if happening.Category == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Category is required",
		})
		return
	}

	if err := c.Repository.Create(&happening); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create happening",
		})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "Happening created successfully",
		"data":    happening,
	})
}
