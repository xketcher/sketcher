FROM node:18-alpine

WORKDIR /app

# tools
RUN npm install -g esbuild serve

# copy project as-is
COPY . .

# bundle TS/TSX but keep react external (CDN importmap)
RUN esbuild index.tsx \
  --bundle \
  --platform=browser \
  --format=esm \
  --outfile=dist/index.js \
  --loader:.ts=ts \
  --loader:.tsx=tsx \
  --external:react \
  --external:react-dom \
  --external:react-dom/client \
  --external:lucide-react \
  --external:@google/genai

# copy html
RUN cp index.html dist/index.html

EXPOSE 3000

CMD ["serve", "dist", "-l", "3000"]
