package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/smartx-web/idoma-connect/backend/internal/sound/model"
	"github.com/smartx-web/idoma-connect/backend/internal/sound/repository"
)

type ArtistController struct {
	repo *repository.ArtistRepository
}

func NewArtistController(repo *repository.ArtistRepository) *ArtistController {
	return &ArtistController{repo: repo}
}

func (c *ArtistController) GetApproved(ctx *gin.Context) {
	artists, err := c.repo.GetApproved(ctx.Request.Context())
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch artists",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": artists,
	})
}

func (c *ArtistController) GetAll(ctx *gin.Context) {
	artists, err := c.repo.GetAll(ctx.Request.Context())
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch artists",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": artists,
	})
}

func (c *ArtistController) GetByID(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		return
	}

	artist, err := c.repo.GetByID(ctx.Request.Context(), id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": "artist not found",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": artist,
	})
}

func (c *ArtistController) Create(ctx *gin.Context) {
	var artist model.SoundArtist

	if err := ctx.ShouldBindJSON(&artist); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid artist data",
		})
		return
	}

	if artist.Name == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "artist name is required",
		})
		return
	}

	if err := c.repo.Create(ctx.Request.Context(), &artist); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create artist",
		})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "artist submitted successfully",
		"data":    artist,
	})
}

func (c *ArtistController) UpdateStatus(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		return
	}

	var request struct {
		Status string `json:"status" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "status is required",
		})
		return
	}

	if request.Status != "pending" &&
		request.Status != "approved" &&
		request.Status != "rejected" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid status",
		})
		return
	}

	if err := c.repo.UpdateStatus(
		ctx.Request.Context(),
		id,
		request.Status,
	); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to update artist status",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "artist status updated successfully",
	})
}
