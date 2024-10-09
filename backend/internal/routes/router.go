package routes

import (
	"srv_users/internal/app"
	"srv_users/internal/handlers"

	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *app.AppServer) {

	app.HttpServer.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello World")
	})

	app.HttpServer.Get("/health", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	app.HttpServer.Get("/checkfns/:inn", handlers.CheckFns(app.DB))
	app.HttpServer.Get("/checkgiis/:inn", handlers.CheckGIIS)

}
