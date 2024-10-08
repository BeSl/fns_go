package routes

import (
	"srv_users/internal/handlers"

	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App) {

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello World")
	})

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	app.Get("/checkfns/:inn", handlers.CheckFns)
	app.Get("/checkgiis/:inn", handlers.CheckGIIS)

}
