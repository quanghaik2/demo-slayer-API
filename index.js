const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const app = express();
const port = 3000;


const url = "https://kimetsu-no-yaiba.fandom.com/wiki/Kimetsu_no_Yaiba_Wiki"
const NhanVaturl = "https://kimetsu-no-yaiba.fandom.com/wiki/"
//Set up
app.use(bodyParser.json({limit: "50mb"}));
app.use(cors());
dotenv.config()
app.use(
    bodyParser.urlencoded({
        limit: "50mb",
        extended: true,
        parameterLimit: "50000",
    })
)



// Router 
// Lấy Tất Cả Nhân Vật
app.get('/v1', (req, resp) => {
    const thumbnails = []
    const limit = Number(req.query.limit);
    try{
        axios(url).then(res => {
            const html = res.data;
            const $ = cheerio.load(html);   
            $(".portal",html).each(function(){
                const name = $(this).find("a").attr("title");
                const url = $(this).find("a").attr("href");
                const img = $(this).find("a > img").attr("data-src");
                const obj = {
                    name: name, 
                    url: "https://demo-slayer-api.onrender.com/v1" + url.split("/wiki")[1], 
                    img: img
                }
                thumbnails.push(obj);
            })
          if(limit)
          {
            resp.status(200).json(thumbnails.slice(0, limit));
          } 
          else{
            resp.status(200).json(thumbnails);
          }
        })
        
    } catch(err){
        resp.status(500).json(err);
    }
})
// Lấy Nhân Vật
app.get("/v1/:NhanVat", (req,resp) =>{
    let urlnv = NhanVaturl + req.params.NhanVat;
    const titles = [];
    const details = [];
    const NhanVatOBJ = {};
    const nhanvat = [];
    const galleries = [];
    try{
        axios(urlnv).then(res => {
            const html = res.data;
            const $ = cheerio.load(html);
            $(".wikia-gallery-item",html).each(function (){
                const gallery = $(this).find("a > img").attr("data-src");
                galleries.push(gallery);
            })

            $("aside",html).each(function(){
                //lay img
                const img = $(this).find("img").attr("src");
                //laays key
                $(this).find("section > div > h3").each(function(){
                    titles.push($(this).text())
                })
                // lay valuse
                $(this).find("section > div > div").each(function(){
                    details.push($(this).text())
                })
                if(img !== undefined){
                    
                    for(let i = 0 ; i < titles.length; i++){
                        NhanVatOBJ[titles[i].toLowerCase()] = details[i];
                    }
                    nhanvat.push({
                        name: req.params.NhanVat.replace("_"," "),
                        gallery: galleries,
                        img : img,
                        ...NhanVatOBJ
                    });
                }
            })
            
             resp.status(200).json(nhanvat);
        })
       
    }
    catch(err){
        resp.status(500).json(err);
    }
})

app.get('/', (req, resp) =>{
    resp.sendFile(path.join(__dirname, './index.html'));
})

// Run port 
app.listen(process.env.PORT || port , () => console.log("listening on port"));