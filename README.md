Set-Up

- (in .env) Riot API key
- (in .env) Discord Developer application (OAuth2) keyes
- (in .env) Prisma API Key
- Needs set-up: server/web, and Prisma Database (below)

___________________________
Prisma Database
  Setting Up Prisma:
  
    cd server
    npm install
    
    npx prisma migrate dev
    npx prisma generate
    
    npm run dev
    
    http://localhost:5050 (5050 specifically coded in cors and other functions/files)
    
    To run Prisma Studio for Database demonstration:
    
      cd server
      npx prisma studio
__________________________
