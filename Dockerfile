# Imagem Base Oficial Node.js 22 LTS Alpine (Leve e Segura)
FROM node:22-alpine

# Diretório de trabalho dentro do container
WORKDIR /app

# Instala dependências de produção
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Copia todo o código da aplicação
COPY . .

# Cria pasta de dados para persistência e concede permissões
RUN mkdir -p /app/data && chown -R node:node /app

# Define variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3333

# Usuário não-root por segurança
USER node

# Volume para persistir dados (storage.json e PDFs de estudo)
VOLUME ["/app/data"]

# Expõe a porta interna da aplicação
EXPOSE 3333

# Comando de inicialização
CMD ["node", "server.js"]
