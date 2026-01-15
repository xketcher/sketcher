FROM node:18-alpine

WORKDIR /app

# tools
RUN npm install -g esbuild serve

# copy everything AS-IS
COPY . .

# bundle TS/TSX at runtime
RUN esbuild index.tsx \
  --bundle \
  --format=esm \
  --platform=browser \
  --outfile=dist/index.js \
  --loader:.ts=ts \
  --loader:.tsx=tsx

# copy original html
RUN cp index.html dist/index.html

EXPOSE 3000

CMD ["serve", "dist", "-l", "3000"]
