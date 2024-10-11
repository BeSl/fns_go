package config

type AppConfig struct {
	PDF_PATH_URL string
	Service_URL  string
	Port         string
	DbPath       string
	PortExt      string
}

func NewConfig() *AppConfig {
	return &AppConfig{
		PDF_PATH_URL: "pdf",
		Service_URL:  "http://komp573",
		Port:         "9000",
		PortExt:      "9001",
		DbPath:       "local.db",
	}
}
