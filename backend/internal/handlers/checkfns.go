package handlers

import (
	"encoding/json"
	"srv_users/internal/models/query"
	"srv_users/internal/storage"
	"srv_users/utils/fnspars"

	"github.com/gofiber/fiber/v2"
)

func CheckFns(c *fiber.Ctx) error {
	inn := c.Params("inn")
	if inn == "" {
		c.SendStatus(fiber.StatusBadRequest)
	}
	res, err := findInCacheFNSQuery(inn)
	if err == nil {
		return c.SendString(res)
	}

	fns := fnspars.NewFNSParse(inn)
	resData, err := fns.GetFullInfoContractor()
	if err != nil {
		c.SendStatus(fiber.StatusBadRequest)
	}
	par, err := json.Marshal(resData)
	addCacheQuery(inn, par)
	return c.JSON(resData)
}

func findInCacheFNSQuery(inn string) (string, error) {

	queryname := "checkfns"
	var dt query.QueryHistory
	storage.DBConnndb().Where("inn = ? and name_query = ?", inn, queryname).First(&dt)

	if dt.ID != 0 {
		return dt.DataResponse, nil
	}

	return "", fiber.NewError(200, "not find")
}

func addCacheQuery(inn string, data []byte) {
	queryname := "checkfns"
	datastring := string(data)

	storage.DBConnndb().Create(&query.QueryHistory{NameQuery: queryname, Inn: inn, DataResponse: datastring})
}
