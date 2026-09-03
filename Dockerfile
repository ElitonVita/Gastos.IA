# Imagem mínima: sem dependências npm (build.js e server.js só usam módulos
# nativos do Node). O build (node build.js) roda no CMD, não aqui — assim,
# se você montar um volume em /app/dist (veja docker-compose.yml), o
# dist/index.html é sempre regenerado fresco a partir de src/ a cada start,
# e o gastos-data.json que já estiver lá (o build nunca mexe nele) sobrevive.
FROM node:22-alpine

WORKDIR /app
COPY . .

ENV PORT=8080
ENV HOST=0.0.0.0

EXPOSE 8080

CMD ["sh", "-c", "node build.js && node server.js"]
