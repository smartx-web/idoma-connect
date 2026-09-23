package controller

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"

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

/* =========================
   PUBLIC — PUBLISHED HAPPENINGS
========================= */

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

/* =========================
   ADMIN — ALL HAPPENINGS
========================= */

func (c *HappeningController) GetAllAdmin(ctx *gin.Context) {
	happenings, err := c.Repository.GetAllAdmin()

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

/* =========================
   ADMIN — DASHBOARD STATS
========================= */

func (c *HappeningController) GetStats(ctx *gin.Context) {

	stats, err := c.Repository.GetStats()

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch happening statistics",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": stats,
	})
}

/* =========================
   ADMIN — CREATE HAPPENING
========================= */

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

/* =========================
   ADMIN — PUBLISH / UNPUBLISH
========================= */

type UpdatePublishedRequest struct {
	Published *bool `json:"published"`
}

func (c *HappeningController) UpdatePublished(ctx *gin.Context) {

	idParam := ctx.Param("id")

	id, err := strconv.ParseInt(idParam, 10, 64)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid happening ID",
		})
		return
	}

	var request UpdatePublishedRequest

	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
		})
		return
	}

	if request.Published == nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Published status is required",
		})
		return
	}

	err = c.Repository.UpdatePublished(
		id,
		*request.Published,
	)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update happening status",
		})
		return
	}

	status := "unpublished"

	if *request.Published {
		status = "published"
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Happening " + status + " successfully",
	})
}

/* =========================
   ADMIN — UPDATE HAPPENING
========================= */

func (c *HappeningController) Update(ctx *gin.Context) {

	idParam := ctx.Param("id")

	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid happening ID",
		})
		return
	}

	var happening model.Happening

	if err := ctx.ShouldBindJSON(&happening); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
		})
		return
	}

	happening.ID = uint(id)

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

	if err := c.Repository.Update(&happening); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update happening",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Happening updated successfully",
	})
}
func (c *HappeningController) Delete(ctx *gin.Context) {
	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid happening ID",
		})
		return
	}

	err = c.Repository.Delete(id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			ctx.JSON(http.StatusNotFound, gin.H{
				"error": "Happening not found",
			})
			return
		}

		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete happening",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Happening deleted successfully",
	})
}
