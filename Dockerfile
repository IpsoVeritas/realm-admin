FROM alpine

COPY realm-admin-ng-linux-amd64 /realm-admin-ng

WORKDIR /
CMD /realm-admin-ng

EXPOSE 6580
