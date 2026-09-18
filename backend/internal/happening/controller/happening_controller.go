package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
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
