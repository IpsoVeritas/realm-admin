//go:generate npm install
//go:generate ./node_modules/.bin/ng build --prod --bh ./
//go:generate go-bindata -prefix "dist/" -pkg main -o bindata.go dist/...
package maingo-bindata -prefix "dist/" -pkg main -o bindata.go dist/...


import (
	"bytes"
	"fmt"
	"io"
	"net/http"

	"github.com/spf13/viper"

	logger "gitlab.brickchain.com/libs/go-logger.v1"

	"github.com/Sirupsen/logrus"

	"strings"

	"mime"

	"os"
)

func static_handler(rw http.ResponseWriter, req *http.Request) {
	var path string = req.URL.Path

	agent := strings.Split(req.UserAgent(), "/")[0]
	ignore := false
	for _, f := range []string{"GoogleHC"} {
		if agent == f {
			ignore = true
		}
	}

	if !ignore {
		fields := logger.Fields{
			"host":         req.Host,
			"proto":        req.Proto,
			"method":       req.Method,
			"request":      req.RequestURI,
			"remote":       req.RemoteAddr,
			"referer":      req.Referer(),
			"user-agent":   req.UserAgent(),
			"request-size": req.ContentLength,
		}
		log := logger.WithFields(fields)

		log.Info(path)
	}

	if path == "" {
		path = "index.html"
	}

	if strings.HasSuffix(path, "/") {
		path = fmt.Sprintf("%sindex.html", path)
	}

	if path == "config.json" {
		base := os.Getenv("BASE")
		if base == "" {
			base = req.Host
		}
		if !strings.Contains(base, "http") {
			base = fmt.Sprintf("https://%s/realm-api", base)
		} else {
			base = fmt.Sprintf("%s/realm-api", base)
		}
		settings := fmt.Sprintf(`{
  "backend": "%s"
}`, base)
		rw.Header().Set("Content-Type", "application/json")
		rw.Write([]byte(settings))
		return
	}

	pathParts := strings.Split(path, ".")
	if len(pathParts) > 1 {
		mimeType := mime.TypeByExtension("." + pathParts[1])
		rw.Header().Set("Content-Type", mimeType)
	}

	if bs, err := Asset(path); err != nil {
		rw.WriteHeader(http.StatusNotFound)
	} else {
		var reader = bytes.NewBuffer(bs)
		io.Copy(rw, reader)
	}
}

func main() {

	viper.AutomaticEnv()
	viper.SetDefault("log_formatter", "text")
	viper.SetDefault("log_level", "debug")
	viper.SetDefault("addr", ":6580")

	logger.SetFormatter(viper.GetString("log_formatter"))
	logger.SetLevel(viper.GetString("log_level"))

	var port string = viper.GetString("addr")

	prefix, ok := os.LookupEnv("HTTP_PREFIX")
	if !ok {
		prefix = "/"
	}

	http.Handle(prefix, http.StripPrefix(prefix, http.HandlerFunc(static_handler)))
	logrus.Infof("Listening on %v for %s", port, prefix)
	logrus.Fatal(http.ListenAndServe(port, nil))
}
