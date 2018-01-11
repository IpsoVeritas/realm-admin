/*
Logger for Brickchain software
*/
package logger

import (
	"io"
	"os"
	"runtime"
	"sync"

	"log"

	"github.com/Sirupsen/logrus"
)

var (
	ctxlogger *logrus.Entry
	mu        *sync.Mutex
)

type Fields map[string]interface{}

func init() {
	mu = &sync.Mutex{}
	mu.Lock()
	defer mu.Unlock()
	logrus.SetOutput(os.Stdout)
	hostname, _ := os.Hostname()
	ctxlogger = logrus.WithField("pid", os.Getpid()).WithField("hostname", hostname)

}

func GetLogger() *logrus.Entry {
	return ctxlogger
}

func AddContext(key string, value interface{}) {
	mu.Lock()
	defer mu.Unlock()
	ctxlogger = ctxlogger.WithField(key, value)
}

func SetFormatter(formatter string) {
	var _formatter logrus.Formatter
	switch formatter {
	case "json":
		_formatter = &logrus.JSONFormatter{}
	default:
		_formatter = &logrus.TextFormatter{}
	}
	mu.Lock()
	defer mu.Unlock()
	data := ctxlogger.Data
	logrus.SetFormatter(_formatter)
	ctxlogger = logrus.WithFields(data)
}

func SetOutput(out io.Writer) {
	mu.Lock()
	defer mu.Unlock()
	data := ctxlogger.Data
	logrus.SetOutput(out)
	ctxlogger = logrus.WithFields(data)
}

func SetLevel(level string) {
	_level, err := logrus.ParseLevel(level)
	if err != nil {
		_level = logrus.InfoLevel
	}
	mu.Lock()
	defer mu.Unlock()
	data := ctxlogger.Data
	logrus.SetLevel(_level)
	ctxlogger = logrus.WithFields(data)
}

func GetLoglevel() string {
	return logrus.GetLevel().String()
}

func WithField(key string, value interface{}) *logrus.Entry {
	return ctxlogger.WithField(key, value)
}

func WithFields(fields Fields) *logrus.Entry {
	_fields := logrus.Fields{}
	for k, v := range fields {
		_fields[k] = v
	}
	return ctxlogger.WithFields(_fields)
}

// Wrapper for Logrus Debug()
func Debug(args ...interface{}) {
	loggerWithCaller().Debug(args...)
}

// Wrapper for Logrus Info()
func Info(args ...interface{}) {
	loggerWithCaller().Info(args...)
}

// Wrapper for Logrus Warn()
func Warn(args ...interface{}) {
	loggerWithCaller().Warn(args...)
}

// Wrapper for Logrus Error()
func Error(args ...interface{}) {
	loggerWithCaller().Error(args...)
}

// Wrapper for Logrus Fatal()
func Fatal(args ...interface{}) {
	loggerWithCaller().Fatal(args...)
}

func Errorf(format string, args ...interface{}) {
	loggerWithCaller().Errorf(format, args...)
}

func Infof(format string, args ...interface{}) {
	loggerWithCaller().Infof(format, args...)
}

func Warningf(format string, args ...interface{}) {
	loggerWithCaller().Warningf(format, args...)
}

func Debugf(format string, args ...interface{}) {
	loggerWithCaller().Debugf(format, args...)
}

func loggerWithCaller() *logrus.Entry {
	_, file, line, _ := runtime.Caller(2)
	fields := logrus.Fields{
		"file": file,
		"line": line,
	}
	return ctxlogger.WithFields(fields)
}

func GetWriter() io.Writer {
	return &LogWriter{
		level: "info",
	}
}

func GetWriterWithLevel(level string) io.Writer {
	return &LogWriter{
		level: level,
	}
}

type LogWriter struct {
	level string
}

func (l *LogWriter) Write(p []byte) (n int, err error) {
	switch l.level {
	case "debug":
		Debug(string(p))
	case "info":
		Info(string(p))
	case "error":
		Error(string(p))
	}
	return len(p), nil
}

func GetStandardLogger(level string) *log.Logger {
	writer := GetWriterWithLevel(level)

	return log.New(writer, "", 0)
}
