package main

import (
	"srv_users/utils/fnspars"

	"gofr.dev/pkg/gofr"
)

func main() {

	// query := "7707083893" // пример ИНН
	app := gofr.New()

	app.GET("/check/{inn}", CheckHandler)
	app.Run()
}

func CheckHandler(c *gofr.Context) (interface{}, error) {
	inn := c.Param("inn")
	if inn == "" {
		c.Log("INN came empty")
	}

	fns := fnspars.NewFNSParse(inn)
	res, err := fns.GetFullInfoContractor()

	return res, err
}
