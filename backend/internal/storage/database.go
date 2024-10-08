package storage

import (
	"fmt"
	"srv_users/internal/models/query"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var (
	DBConn *gorm.DB
)

func NewStorage() error {
	var err error
	DBConn, err := gorm.Open(sqlite.Open("local.db"))

	gorm.Open(sqlite.Open("local.db"))
	if err != nil {
		panic("failed to connect database")
	}
	fmt.Println("Connection Opened to Database")

	DBConn.AutoMigrate(&query.QueryHistory{})

	fmt.Println("Database Migrated")
	return nil

}

func DBConnndb() *gorm.DB {
	DBConn, _ := gorm.Open(sqlite.Open("local.db"))

	return DBConn
}
