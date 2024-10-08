package query

import (
	"time"

	"gorm.io/gorm"
)

type QueryHistory struct {
	gorm.Model
	NameQuery    string    `json:"namequery" gorm:"name"`
	Inn          string    `json:"param" gorm:"inn"`
	Date         time.Time `json:"date" gorm:"date" default:time.Now()`
	DataResponse string    `json:"dataresponse gorm:"dataresponse"`
}

func NewQueryHistory(inn string) *QueryHistory {
	return &QueryHistory{
		Inn:  inn,
		Date: time.Now()}
}
