package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/smartx-web/idoma-connect/backend/internal/sound/model"
	"github.com/smartx-web/idoma-connect/backend/internal/sound/repository"
)

type SubmissionController struct {
	repo *repository.SubmissionRepository
}

func NewSubmissionController(
	repo *repository.SubmissionRepository,
) *SubmissionController {
	return &SubmissionController{repo: repo}
}

func (c *SubmissionController) Create(ctx *gin.Context) {
	var submission model.SoundSubmission

	if err := ctx.ShouldBindJSON(&submission); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid submission data",
		})
		return
	}

	if submission.SubmitterName == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "submitter_name is required",
		})
		return
	}

	if submission.ArtistName == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "artist_name is required",
		})
		return
	}

	if submission.Title == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "title is required",
		})
		return
	}

	if submission.SubmissionType != "song" &&
		submission.SubmissionType != "cultural_recording" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid submission_type",
		})
		return
	}

	if err := c.repo.Create(
		ctx.Request.Context(),
		&submission,
	); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to submit sound",
		})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "sound submission received successfully",
		"data":    submission,
	})
}

func (c *SubmissionController) GetAll(ctx *gin.Context) {
	submissions, err := c.repo.GetAll(
		ctx.Request.Context(),
	)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch submissions",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": submissions,
	})
}

func (c *SubmissionController) GetByStatus(ctx *gin.Context) {
	status := ctx.Query("status")

	if status == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "status query parameter is required",
		})
		return
	}

	if status != "pending" &&
		status != "approved" &&
		status != "rejected" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid status",
		})
		return
	}

	submissions, err := c.repo.GetByStatus(
		ctx.Request.Context(),
		status,
	)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch submissions",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": submissions,
	})
}

func (c *SubmissionController) UpdateStatus(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		return
	}

	var request struct {
		Status     string `json:"status" binding:"required"`
		AdminNotes string `json:"admin_notes"`
	}

	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid status data",
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
		request.AdminNotes,
	); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to update submission status",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "submission status updated successfully",
	})
}
