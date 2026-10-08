package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/smartx-web/idoma-connect/backend/internal/sound/model"
	"github.com/smartx-web/idoma-connect/backend/internal/sound/repository"
)

type AlbumController struct {
	repo *repository.AlbumRepository
}

func NewAlbumController(repo *repository.AlbumRepository) *AlbumController {
	return &AlbumController{repo: repo}
}

func (c *AlbumController) GetApproved(ctx *gin.Context) {
	albums, err := c.repo.GetApproved(ctx.Request.Context())
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch albums",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": albums,
	})
}

func (c *AlbumController) GetByArtist(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		return
	}

	albums, err := c.repo.GetByArtist(
		ctx.Request.Context(),
		id,
	)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch artist albums",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": albums,
	})
}

func (c *AlbumController) Create(ctx *gin.Context) {
	var album model.SoundAlbum

	if err := ctx.ShouldBindJSON(&album); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid album data",
		})
		return
	}

	if album.ArtistID == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "artist_id is required",
		})
		return
	}

	if album.Title == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "album title is required",
		})
		return
	}

	if album.AlbumType == "" {
		album.AlbumType = "album"
	}

	if album.AlbumType != "album" &&
		album.AlbumType != "ep" &&
		album.AlbumType != "single" &&
		album.AlbumType != "compilation" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid album type",
		})
		return
	}

	if err := c.repo.Create(
		ctx.Request.Context(),
		&album,
	); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create album",
		})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "album submitted successfully",
		"data":    album,
	})
}

func (c *AlbumController) UpdateStatus(ctx *gin.Context) {
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
			"error": "failed to update album status",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "album status updated successfully",
	})
}
