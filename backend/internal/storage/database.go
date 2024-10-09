package storage

import (
	"fmt"
	"srv_users/internal/config"
	"srv_users/internal/models/query"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type DBStore struct {
	DBConn *gorm.DB
}

func NewStorage(cfg config.AppConfig) *DBStore {
	var err error
	DBConn, err := gorm.Open(sqlite.Open(cfg.DbPath))

	gorm.Open(sqlite.Open(cfg.DbPath))
	if err != nil {
		panic("failed to connect database")
	}
	fmt.Println("Connection Opened to Database")

	DBConn.AutoMigrate(&query.QueryHistory{})

	fmt.Println("Database Migrated")
	return &DBStore{
		DBConn: DBConn,
	}

}
