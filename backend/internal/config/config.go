package config

type AppConfig struct {
	PDF_PATH_URL string
	Service_URL  string
	Port         string
}

func NewConfig() *AppConfig {
	return &AppConfig{
		PDF_PATH_URL: "pdf",
		Service_URL:  "http://localhost",
		Port:         "9001",
	}
}
