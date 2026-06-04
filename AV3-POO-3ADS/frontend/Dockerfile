# Usa a imagem oficial do Node.js
FROM node:18-alpine

# Define o diretório de trabalho no container
WORKDIR /app

# Copia os arquivos de configuração de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todo o código fonte para o container
COPY . .

# Gera o cliente do Prisma
RUN npx prisma generate

# Executa o build da aplicação Next.js
RUN npm run build

# Expõe a porta 3000 que o Next.js usa
EXPOSE 3000

# Aguarda o banco de dados e inicializa a aplicação executando as migrations e o seed
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.js && npm start"]
