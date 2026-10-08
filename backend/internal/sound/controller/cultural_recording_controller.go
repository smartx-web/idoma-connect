package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/smartx-web/idoma-connect/backend/internal/sound/model"
	"github.com/smartx-web/idoma-connect/backend/internal/sound/repository"
)

type CulturalRecordingController struct {
	repo *repository.CulturalRecordingRepository
}

func NewCulturalRecordingController(
	repo *repository.CulturalRecordingRepository,
) *CulturalRecordingController {
	return &CulturalRecordingController{repo: repo}
}

func (c *CulturalRecordingController) GetPublished(ctx *gin.Context) {
	recordings, err := c.repo.GetPublished(
		ctx.Request.Context(),
	)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch cultural recordings",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": recordings,
	})
}

func (c *CulturalRecordingController) GetAll(ctx *gin.Context) {
	recordings, err := c.repo.GetAll(
		ctx.Request.Context(),
	)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch cultural recordings",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": recordings,
	})
}

func (c *CulturalRecordingController) Create(ctx *gin.Context) {
	var recording model.CulturalRecording

	if err := ctx.ShouldBindJSON(&recording); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid cultural recording data",
		})
		return
	}

	if recording.Title == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "title is required",
		})
		return
	}

	if recording.RecordingType == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "recording_type is required",
		})
		return
	}

	if recording.AudioURL == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "audio_url is required",
		})
		return
	}

	if err := c.repo.Create(
		ctx.Request.Context(),
		&recording,
	); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create cultural recording",
		})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "cultural recording submitted successfully",
		"data":    recording,
	})
}

func (c *CulturalRecordingController) UpdatePublished(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		return
	}

	var request struct {
		Published bool `json:"published"`
	}

	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid publication data",
		})
		return
	}

	if err := c.repo.UpdatePublished(
		ctx.Request.Context(),
		id,
		request.Published,
	); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to update publication status",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "publication status updated successfully",
	})
}
