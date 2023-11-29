
all: tsnetspeedtest-linux-arm64 tsnetspeedtest-linux-x86_64 tsnetspeedtest-windows-arm64.exe tsnetspeedtest-windows-x86_64.exe tsnetspeedtest-macos

tsnetspeedtest-windows-arm64.exe: go.mod go.sum tsnetspeedtest.go
	GOOS=windows GOARCH=arm64 go build -o $@ tsnetspeedtest.go

tsnetspeedtest-windows-x86_64.exe: go.mod go.sum tsnetspeedtest.go
	GOOS=windows GOARCH=amd64 go build -o $@ tsnetspeedtest.go

tsnetspeedtest-linux-x86_64: go.mod go.sum tsnetspeedtest.go
	GOOS=linux GOARCH=amd64 go build -o $@ tsnetspeedtest.go

tsnetspeedtest-linux-arm64: go.mod go.sum tsnetspeedtest.go
	GOOS=linux GOARCH=arm64 go build -o $@ tsnetspeedtest.go

tsnetspeedtest-macos: go.mod go.sum tsnetspeedtest.go
	GOOS=darwin GOARCH=arm64 go build -o tsnetspeedtest-macos-arm64 tsnetspeedtest.go
	GOOS=darwin GOARCH=amd64 go build -o tsnetspeedtest-macos-x86_64 tsnetspeedtest.go
	lipo -create -output $@ tsnetspeedtest-macos-arm64 tsnetspeedtest-macos-x86_64

