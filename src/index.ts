import app from './app'

const PORT = 8080

const httpServer = app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`)
})