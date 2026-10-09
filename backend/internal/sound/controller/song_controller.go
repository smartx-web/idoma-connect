package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/smartx-web/idoma-connect/backend/internal/sound/model"
	"github.com/smartx-web/idoma-connect/backend/internal/sound/repository"
)

type SongController struct {
	repo *repository.SongRepository
}

func NewSongController(repo *repository.SongRepository) *SongController {
	return &SongController{repo: repo}
}

func (c *SongController) GetApproved(ctx *gin.Context) {
	songs, err := c.repo.GetApproved(ctx.Request.Context())
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch songs",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": songs,
	})
}

func (c *SongController) GetFeatured(ctx *gin.Context) {
	songs, err := c.repo.GetFeatured(ctx.Request.Context())
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch featured songs",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": songs,
	})
}

func (c *SongController) GetByID(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		return
	}

	song, err := c.repo.GetByID(
		ctx.Request.Context(),
		id,
	)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": "song not found",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": song,
	})
}

func (c *SongController) GetByCategory(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		return
	}

	songs, err := c.repo.GetByCategory(
		ctx.Request.Context(),
		id,
	)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch songs by category",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": songs,
	})
}

func (c *SongController) Create(ctx *gin.Context) {
	var song model.SoundSong

	if err := ctx.ShouldBindJSON(&song); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid song data",
		})
		return
	}

	if song.ArtistID == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "artist_id is required",
		})
		return
	}

	if song.Title == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "song title is required",
		})
		return
	}

	if song.AudioURL == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "audio_url is required",
		})
		return
	}

	if err := c.repo.Create(
		ctx.Request.Context(),
		&song,
	); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create song",
		})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "song submitted successfully",
		"data":    song,
	})
}

func (c *SongController) UpdateStatus(ctx *gin.Context) {
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
			"error": "failed to update song status",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "song status updated successfully",
	})
}

func (c *SongController) IncrementPlayCount(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		return
	}

	if err := c.repo.IncrementPlayCount(
		ctx.Request.Context(),
		id,
	); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to update play count",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "play count updated",
	})
}

func (c *SongController) GetAll(ctx *gin.Context) {
	songs, err := c.repo.GetAll(ctx.Request.Context())
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch songs",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": songs,
	})
}

