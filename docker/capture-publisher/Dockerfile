FROM debian:bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY entrypoint.sh /usr/local/bin/tvbox-capture-publisher
RUN chmod +x /usr/local/bin/tvbox-capture-publisher

ENTRYPOINT ["tvbox-capture-publisher"]
