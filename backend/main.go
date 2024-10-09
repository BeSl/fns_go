package main

import (
	"log"
	"srv_users/internal/app"
	"srv_users/internal/config"
	"srv_users/internal/routes"
)

const pdfURL = "pdf"

func main() {

	config := config.NewConfig()
	// query := "7707083893" // пример ИНН

	server := app.NewAppServer(*config)
	routes.RegisterRoutes(server)

	log.Fatal(server.StartServer())
}
