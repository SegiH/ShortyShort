FROM node:18-alpine AS build
 
WORKDIR /app

RUN mkdir -p /app/API

RUN mkdir -p /app/Web

COPY API /app/API
COPY Web /app/Web
COPY database.json /app

FROM node:18-alpine AS runner
 
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
  
EXPOSE 8080
 
COPY --from=build /app /app

ENV PORT=8080

ENV HOSTNAME=0.0.0.0
 
WORKDIR /app/API
 
CMD ["node", "ShortyShortAPI.js"]