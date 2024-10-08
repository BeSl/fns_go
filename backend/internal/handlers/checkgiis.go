package handlers

import "github.com/gofiber/fiber/v2"

func CheckGIIS(c *fiber.Ctx) error {
	return c.SendStatus(500)
}
