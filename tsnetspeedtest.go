package main

import (
	"context"
	"crypto/rand"
	"crypto/tls"
	"embed"
	"flag"
	"io"
	"io/fs"
	"log"
	"net/http"
	"strconv"

	"golang.org/x/sync/errgroup"
	"tailscale.com/tsnet"
)

var (
	addr  = flag.String("addr", ":80", "tailscale address to listen on")
	saddr = flag.String("saddr", ":5080", "standard address to listen on")
)

//go:embed static/*.html
var staticHtml embed.FS

//go:embed speedtest/*.js
var speedtestWorkerJs embed.FS

func main() {
	flag.Parse()
	s := new(tsnet.Server)
	defer s.Close()
	ln, err := s.Listen("tcp", *addr)
	if err != nil {
		log.Fatal(err)
	}
	defer ln.Close()

	lc, err := s.LocalClient()
	if err != nil {
		log.Fatal(err)
	}

	if *addr == ":443" {
		ln = tls.NewListener(ln, &tls.Config{
			GetCertificate: lc.GetCertificate,
		})
	}

	mux := http.NewServeMux()

	// For the static HTML content
	staticFs, err := fs.Sub(staticHtml, "static")
	if err != nil {
		log.Fatal(err)
	}
	mux.Handle("/", http.FileServer(http.FS(staticFs)))

	// For the speedtest JavaScript files
	speedtestFs, err := fs.Sub(speedtestWorkerJs, "speedtest")
	if err != nil {
		log.Fatal(err)
	}
	mux.Handle("/speedtest/", http.StripPrefix("/speedtest/", http.FileServer(http.FS(speedtestFs))))

	mux.HandleFunc("/speedtest/garbage", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Description", "File Transfer")
		w.Header().Set("Content-Type", "application/octet-stream")
		w.Header().Set("Content-Disposition", "attachment; filename=random.dat")
		w.Header().Set("Content-Transfer-Encoding", "binary")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
		w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0, s-maxage=0")
		w.Header().Set("Cache-Control", "post-check=0, pre-check=0")
		w.Header().Set("Pragma", "no-cache")

		ckSize, _ := strconv.ParseInt(r.URL.Query().Get("ckSize"), 10, 64)
		if ckSize == 0 || ckSize > 2048 {
			ckSize = 4
		}

		data := make([]byte, 1024*1024)
		io.ReadAtLeast(rand.Reader, data, len(data))
		for ckSize > 0 {
			_, err := w.Write(data)
			if err != nil {
				break
			}
			ckSize--
		}
	})

	mux.HandleFunc("/speedtest/empty", func(w http.ResponseWriter, r *http.Request) {
	})
	grp, _ := errgroup.WithContext(context.Background())

	grp.Go(func() error {
		return http.Serve(ln, mux)
	})

	grp.Go(func() error {
		return http.ListenAndServe(*saddr, mux)
	})

	log.Fatal(grp.Wait())
}
