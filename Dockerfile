FROM node:20-alpine

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

COPY backend/ ./
COPY frontend/ /app/frontend/

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]