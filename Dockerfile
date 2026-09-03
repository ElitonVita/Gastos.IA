# Imagem mínima: sem dependências npm (build.js e server.js só usam módulos
# nativos do Node).
#
# STATIC_DIR decide tudo: é a pasta que vira o site (onde o index.html mora) E
# onde o gastos-data.json é lido/gravado. Não é "dist" nem nenhum nome fixo —
# aponte pra qualquer pasta que você já usa (monte um volume nela no compose/
# `docker run -v`). No start do container:
#   - se essa pasta já tiver um index.html (você copiou o seu ali, do jeito que
#     já fazia antes), ele NÃO é sobrescrito — só entra o server.js servindo e
#     persistindo ao lado dele.
#   - se estiver vazia (primeira vez), gera um index.html a partir do src/
#     deste repo, uma vez, pra já subir funcionando sem passo manual nenhum.
FROM node:22-alpine

WORKDIR /app
COPY . .

ENV PORT=8080
ENV HOST=0.0.0.0
ENV STATIC_DIR=/app/site

EXPOSE 8080

CMD ["sh", "-c", "[ -f \"$STATIC_DIR/index.html\" ] || BUILD_OUT_DIR=\"$STATIC_DIR\" node build.js; node server.js"]
