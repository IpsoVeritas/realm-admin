
ARG BUILDER=golang:1.16

FROM node:9 as node

WORKDIR /code/realm-admin
ADD src src
ADD "*.json" ./
ADD "*.js" ./
RUN npm install
RUN ./node_modules/.bin/ng build --prod --bh ./

FROM ${BUILDER} AS build

ARG GITHUB_USER
ARG GITHUB_PASSWORD
RUN echo "machine github.com login ${GITHUB_USER} password ${GITHUB_PASSWORD}" > ~/.netrc
ENV GOPRIVATE=github.com/IpsoVeritas

RUN go get -u github.com/jteeuwen/go-bindata/...

WORKDIR /code/realm-admin
ADD go.mod .
ADD go.sum .
RUN go mod download

ADD . .
COPY --from=node /code/realm-admin/dist dist
RUN go generate
RUN CGO_ENABLED=0 GOOS=linux go build -o /realm-admin .

FROM alpine

COPY --from=build /realm-admin /realm-admin

WORKDIR /
CMD /realm-admin

EXPOSE 6580
