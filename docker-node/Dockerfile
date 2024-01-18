FROM node:20-alpine
# khai báo cổng mà ứng dụng muốn nge khi nó chạy
EXPOSE 3000

WORKDIR /docker-node

RUN npm i npm@latest -g

COPY package.json package-lock.json ./

RUN npm install

COPY . .
# Xác định lệnh mặc định được thực hiện khi container được khởi chạy
CMD ["node", "server.js"]
