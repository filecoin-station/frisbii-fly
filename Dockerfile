FROM golang:1.20
WORKDIR /app
COPY frisbii/go.mod frisbii/go.sum ./
RUN go mod download
COPY frisbii/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o=./frisbii ./cmd/frisbii
COPY car/ ./car
EXPOSE 3747
CMD ["./frisbii", "--car=./car/*.car"]