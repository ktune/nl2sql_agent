FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npx tsc -p tsconfig.build.json
RUN ls -la /app/dist
EXPOSE 3000
CMD ["npm", "run", "start:docker"]