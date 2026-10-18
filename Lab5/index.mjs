const solarSystem = (await import('npm-solarsystem')).default;
import express from 'express';
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/favicon.ico", (req, res) => res.status(204).end());

app.get('/', async (req, res) => {
   
   let results = [];
   let errorMessage = null;

   let apiKey = "57948905-c6526466797446e4c4cb2d974";
   let url = "https://pixabay.com/api/?key=" + apiKey + "&q=planets&image_type=photo";

   try {

      const response = await fetch(url);

      if (!response.ok) {
         throw new Error("Error accessing API endpoint");
      }

      const data = await response.json();
      
      for(let i = 0; i < 4 && data.hits.length > 0; i++){
         let randomNumber = parseInt(Math.random() * data.hits.length);
         results.push(data.hits[randomNumber].webformatURL);
         data.hits.splice(randomNumber, 1);
      }

      res.render('home.ejs', { name: "Welcome to Solar System", resultImages: results, errorMessage: null });

   } catch (err) {

      console.log(err.message);
      errorMessage = "could not request random images";
      res.render('home.ejs', { name: "Welcome to Solar System", resultImages: [], errorMessage: errorMessage });

   }

});


app.get('/planetInfo', (req, res) => {
   let planet = req.query.planet;

   try {

      let planetInfo;

      switch(planet){
         case "Mercury":
            planetInfo = solarSystem.getMercury();
            break;
         case "Venus":
            planetInfo = solarSystem.getVenus();
            break;
         case "Earth":
            planetInfo = solarSystem.getEarth();
            break;
         case "Mars":
            planetInfo = solarSystem.getMars();
            break;
         case "Jupiter":
            planetInfo = solarSystem.getJupiter();
            break;
         case "Saturn":
            planetInfo = solarSystem.getSaturn();
            break;
         case "Uranus":
            planetInfo = solarSystem.getUranus();
            break;
         case "Neptune":
            planetInfo = solarSystem.getNeptune();
            break;
         case "Asteroids":
            planetInfo = solarSystem.getAsteroids();
            break;
         case "Comets":
            planetInfo = solarSystem.getComets();
            break;
         default:
            throw new Error("Planet not found");
      }

      res.render('planet.ejs', { name: planet, image: planetInfo.image, planetInfo: planetInfo });

   } catch (err) {

      console.log(err.message);
      res.render('planet.ejs', { name: "Planet not found", image: "/images/404 error.png", planetInfo: null });

   }

});

app.get('/pod', async (req, res) => {
   try {
      let response = await fetch("https://science.nasa.gov/wp-json/wp/v2/apod-basic/?api_key=O473Tgh6pvXV9kgPuQWZvX3lxWGxalmWgqdpX7qX");
      let data = await response.json();
      let apod = data[0];

      let video = "";

      if(apod.media_type == "video"){
         let match = apod.basic_html.match(/<iframe[^>]*src="([^"]+)"/);

         if(match){
            video = match[1];

            if(video.startsWith("//")){
               video = "https:" + video;
            }
         }
      }

      res.render('pod.ejs', {
         name: "NASA Picture of the Day",
         mediaType: apod.media_type,
         image: apod.hdurl,
         video: video
      });

   } catch (err) {
      console.log(err.message);

      res.render('pod.ejs', {
         name: "NASA Picture of the Day",
         mediaType: "image",
         image: "/images/404 error.png",
         video: ""
      });
   }
});


app.listen(3000, () => {
   console.log('server started');
});