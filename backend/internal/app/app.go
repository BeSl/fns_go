package app

import (
	"srv_users/internal/config"
	"srv_users/internal/storage"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

type AppServer struct {
	DB         *storage.DBStore
	HttpServer *fiber.App
	Config     *config.AppConfig
}

func NewAppServer(cfg config.AppConfig) *AppServer {

	app := fiber.New(fiber.Config{
		Prefork:       false,
		CaseSensitive: true,
		StrictRouting: true,
		ServerHeader:  "CheCont",
		AppName:       "Backend Cheker Contractor 1.1.0.1",
	})
	// app.Use(cors.New())
	app.Static("/"+cfg.PDF_PATH_URL, "./files")
	app.Use(logger.New(logger.Config{
		Format: "[${ip}]:${port} ${status} - ${method} ${path}\n",
	}))

	return &AppServer{
		DB:         storage.NewStorage(cfg),
		HttpServer: app,
		Config:     &cfg,
	}

}

func (s *AppServer) StartServer() error {
	return s.HttpServer.Listen(":" + s.Config.Port)
}
