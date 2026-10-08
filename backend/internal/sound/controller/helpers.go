package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func parseID(ctx *gin.Context) (uint, error) {
	idParam := ctx.Param("id")

	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil || id == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid ID",
		})

		return 0, err
	}

	return uint(id), nil
}
