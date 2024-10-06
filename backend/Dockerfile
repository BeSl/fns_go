FROM golang:latest

WORKDIR /usr/app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN go build

EXPOSE 9000

CMD ["./golang-nextjs-docker"]