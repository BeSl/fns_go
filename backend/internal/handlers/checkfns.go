package handlers

import (
	"encoding/json"
	"srv_users/internal/models/query"
	"srv_users/internal/storage"
	"srv_users/utils/fnspars"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func CheckFns(store *storage.DBStore) func(*fiber.Ctx) error {

	return func(c *fiber.Ctx) error {
		inn := c.Params("inn")
		if inn == "" {
			c.SendStatus(fiber.StatusBadRequest)
		}
		res, err := findInCacheFNSQuery(inn, store)
		if err == nil {
			return c.SendString(res)
		}

		fns := fnspars.NewFNSParse(inn)
		resData, err := fns.GetFullInfoContractor()
		if err != nil {
			c.SendStatus(fiber.StatusBadRequest)
		}
		par, err := json.Marshal(resData)
		addCacheQuery(inn, par, store)
		return c.JSON(resData)
	}
}

func findInCacheFNSQuery(inn string, db *storage.DBStore) (string, error) {

	queryname := "checkfns"
	var dt query.QueryHistory
	currentDate := time.Now().Format("2006-01-02")
	db.DBConn.Where("inn = ? AND name_query = ? AND DATE(date) = ?", inn, queryname, currentDate).First(&dt)

	// if result.Error != nil {
	// 	if result.Error != gorm.ErrRecordNotFound {
	// 		return "", fiber.NewError(200, "not find")
	// 	}
	// }

	if dt.ID != 0 {
		return dt.DataResponse, nil
	}

	return "", fiber.NewError(200, "not find")
}

func addCacheQuery(inn string, data []byte, db *storage.DBStore) {
	queryname := "checkfns"
	datastring := string(data)
	now := time.Now()
	startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	db.DBConn.Create(&query.QueryHistory{
		Model:        gorm.Model{},
		NameQuery:    queryname,
		Inn:          inn,
		Date:         startOfDay,
		DataResponse: datastring,
	})
}
