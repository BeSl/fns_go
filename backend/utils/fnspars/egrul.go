package fnspars

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"srv_users/internal/config"
	"time"
)

const FNS_URI = "https://egrul.nalog.ru/"
const SLEEP_TIME = 3

// RequestStruct структура для отправки данных запроса
type RequestStruct struct {
	Query                     string `json:"query"`
	Vyp3CaptchaToken          string `json:"vyp3CaptchaToken"`
	Page                      string `json:"page"`
	Region                    string `json:"region"`
	PreventChromeAutocomplete string `json:"PreventChromeAutocomplete"`
}

// ResponseStruct структура для обработки ответа от первого запроса (POST)
type ResponseStruct struct {
	T string `json:"t"`
}

// DataStruct структура для обработки конечного результата
type DataStruct struct {
	Rows []struct {
		Ogrn     string `json:"o"`
		Inn      string `json:"i"`
		Name     string `json:"c"`
		Director string `json:"g"`
		FullName string `json:"n"`
		Token    string `json:"t"`
		// DateRegOGRN time.Time `json:"r"`
	} `json:"rows"`
}

type FullInfoContractor struct {
	Ogrn     string    `json:"ogrn"`
	Inn      string    `json:"inn"`
	Name     string    `json:"name"`
	Director string    `json:"dir"`
	FullName string    `json:"full_name"`
	DateChek time.Time `json:"-"`
	PDF_url  string    `json:"dpf_url"`
}

type FnsChekContractor struct {
	Inn string `json:"inn"`
}

func NewFNSParse(INN string) *FnsChekContractor {

	fpars := FnsChekContractor{
		Inn: INN,
	}
	return &fpars
}

func (fpars *FnsChekContractor) GetFullInfoContractor() (FullInfoContractor, error) {

	data, err := fpars.chekContractor()
	if err != nil {
		return FullInfoContractor{}, fmt.Errorf("ошибка в получении предварительного токена: %v", err)
	} else {
		pdf, err := fpars.getPDFContractor(data.Rows[0].Token)
		if err != nil {
			return FullInfoContractor{}, fmt.Errorf("ошибка в получении выписки ЕГРОЮЛ: %v", err)
		}
		cfg := config.NewConfig()
		return FullInfoContractor{Ogrn: data.Rows[0].Ogrn,
			Inn:      data.Rows[0].Inn,
			Name:     data.Rows[0].Name,
			Director: data.Rows[0].Director,
			FullName: data.Rows[0].FullName,
			PDF_url:  cfg.Service_URL + ":" + cfg.Port + "/" + cfg.PDF_PATH_URL + "/" + pdf}, nil
	}
}

func (fpars *FnsChekContractor) chekContractor() (DataStruct, error) {

	requestBody, err := json.Marshal(RequestStruct{Query: fpars.Inn})
	if err != nil {
		return DataStruct{}, errors.New(fmt.Sprintf("Ошибка формирования тела запроса: %v", err))
	}

	req, err := http.NewRequest("POST", FNS_URI, bytes.NewBuffer(requestBody))
	if err != nil {
		return DataStruct{}, errors.New(fmt.Sprintf("Ошибка создания запроса: %v", err))
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return DataStruct{}, errors.New(fmt.Sprintf("Ошибка выполнения запроса: %v", err))
	}

	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var response ResponseStruct
	if err := json.Unmarshal(body, &response); err != nil {
		return DataStruct{}, fmt.Errorf("Ошибка обработки ответа: %v", err)
	}

	time.Sleep(SLEEP_TIME * time.Second)
	// Шаг 2: Ожидание и получение результатов
	resultURL := fmt.Sprintf("%ssearch-result/%s", FNS_URI, response.T)

	resultReq, err := http.NewRequest("GET", resultURL, nil)
	if err != nil {
		return DataStruct{}, fmt.Errorf("Ошибка создания запроса на результат: %v", err)
	}

	resultResp, err := client.Do(resultReq)
	if err != nil {
		return DataStruct{}, fmt.Errorf("ошибка получения результата: %v", err)
	}
	defer resultResp.Body.Close()

	resultBody, _ := io.ReadAll(resultResp.Body)

	var data DataStruct
	if err := json.Unmarshal(resultBody, &data); err != nil {
		return DataStruct{}, fmt.Errorf("ошибка обработки результата: %v", err)
	}

	return data, nil
}

type DataPDF struct {
	Data []byte    `json:"dpfdata"`
	INN  string    `json:"inn"`
	Date time.Time `json:"date_cheked"`
}

func (fpars *FnsChekContractor) getPDFContractor(token string) (string, error) {

	pdfURL := fmt.Sprintf("%svyp-request/%s", FNS_URI, token)
	PdfReq, err := http.NewRequest("GET", pdfURL, nil)
	if err != nil {
		c_err := fmt.Errorf("ошибка создания запроса на PDF: %v", err)
		return "", c_err
	}

	client := &http.Client{}

	time.Sleep(SLEEP_TIME * time.Second)

	pdfURL = fmt.Sprintf("%svyp-status/%s", FNS_URI, token)

	// tempReq, err := http.NewRequest("GET", pdfURL, nil)
	// if err != nil {
	// 	return "", fmt.Errorf("ошибка проверки состояния запроса на PDF: %v", err)
	// }
	// client = &http.Client{}
	statusResponse, err := client.Do(PdfReq)

	defer statusResponse.Body.Close()
	body, _ := io.ReadAll(statusResponse.Body)
	var response ResponseStruct
	if err := json.Unmarshal(body, &response); err != nil {
		return "", fmt.Errorf("Ошибка обработки ответа: %v", err)
	}

	PdfReq, err = http.NewRequest("GET", fmt.Sprintf("%svyp-download/%s", FNS_URI, response.T), nil)
	if err != nil {
		return "", fmt.Errorf("ошибка проверки состояния запроса на PDF: %v", err)
	}

	pdfResp, err := client.Do(PdfReq)
	if err != nil {
		return "", fmt.Errorf("ошибка проверки состояния запроса на PDF: %v", err)
	}

	defer pdfResp.Body.Close()

	if pdfResp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("ошибка: ожидался статус 200, получен статус %d", pdfResp.StatusCode)
	}

	body, _ = io.ReadAll(pdfResp.Body)
	filepath, err := savePDF(fpars.Inn, body)

	if err != nil {
		return "", fmt.Errorf("ошибка сохранения файла %v", err)
	}

	return filepath, nil

}

func savePDF(inn string, body []byte) (string, error) {
	//file name = inn + date now
	filepath := fmt.Sprintf("files/vypiska_%s_%s.pdf", inn, time.Now().Format("2006_01_02"))
	pdfFile, err := os.Create(filepath)
	if err != nil {
		return "", err
	}

	defer pdfFile.Close()
	io.Copy(pdfFile, bytes.NewReader(body))

	return filepath, nil
}

// // Шаг 5: Сохранение PDF на диск
// pdfFile, err := os.Create("vypiska.pdf")
// if err != nil {
// 	return nil, errors.New(fmt.Sprintf("Ошибка проверки состояния запроса на PDF: %v", err))
// 	log.Fatalf("Ошибка создания файла: %v", err)
// }
// defer pdfFile.Close()

// _, err = io.Copy(pdfFile, pdfResp.Body)
// if err != nil {
// 	log.Fatalf("Ошибка сохранения PDF: %v", err)
// }

// fmt.Println("Выписка успешно сохранена как vypiska.pdf")
