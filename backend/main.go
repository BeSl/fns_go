package main

import (
	"log"
	"srv_users/internal/config"
	"srv_users/internal/routes"
	"srv_users/internal/storage"

	"github.com/gofiber/fiber/v2"

	"github.com/gofiber/fiber/v2/middleware/logger"
)

const pdfURL = "pdf"

func initDatabase() {
	var err error
	err = storage.NewStorage()
	if err != nil {
		panic("failed to connect database")
	}
}

func main() {
	initDatabase()
	config := config.NewConfig()
	// query := "7707083893" // пример ИНН
	// app := gofr.New()
	// app.AddStaticFiles("public", "./files")
	// app.GET("/checkfns", FNSCheckHandler)
	// app.GET("/checkgiis", GIISCheckHandler)
	// app.Run()

	app := fiber.New(fiber.Config{
		Prefork:       false,
		CaseSensitive: true,
		StrictRouting: true,
		ServerHeader:  "CheCont",
		AppName:       "Backend Cheker Contractor 1.1.0.1",
	})
	// app.Use(cors.New())
	app.Static("/"+config.PDF_PATH_URL, "./files")
	app.Use(logger.New(logger.Config{
		Format: "[${ip}]:${port} ${status} - ${method} ${path}\n",
	}))

	routes.RegisterRoutes(app)

	log.Fatal(app.Listen(":" + config.Port))
}
