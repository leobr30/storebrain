# Base image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy app source
COPY . .

ENV DATABASE_URL="postgresql://postgres:Diamantor-G@db:5432/store-brain?schema=public"

# Génère le client Prisma avant de build le projet
RUN npx prisma generate

RUN npm run prisma:seed

# Supprime les anciens builds si jamais
RUN rm -rf dist tsconfig.build.tsbuildinfo

# Build le projet NestJS (src -> dist)
RUN npm run build && \
    cp -r ./src/templates ./dist/templates && \
    ls -la ./dist/templates

# Expose the port
EXPOSE 3001

# Start the server
CMD ["npm", "run", "start:prod"]
