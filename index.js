const express = require('express')
const http = require('http')
const cookieParser = require('cookie-parser');
const path = require('path');
const err404  =require('./middleware/err404')
const Moralis = require("moralis").default;
const cors = require("cors");
require("dotenv").config({ path: ".env" });


const app = express()
const server = http.Server(app);
app.use(express.json())
app.use(cors());
app.use(express.urlencoded({extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'view'));
const MORALIS_API_KEY = process.env.API; 

Moralis.start({
    apiKey: MORALIS_API_KEY,
  })



app.get('/index',async(req,res)=>{
    res.render('index',{
        obj:{}
    })
})

app.post('/index',async(req,res)=>{
    let hash = req.body.input
    if(!hash){return res.send('Block not found')}
    try{
        let block = await Moralis.EvmApi.block.getBlock({chain: "0x1",
            blockNumberOrHash: hash,})

        res.redirect(`/${hash}`)
    }catch(e){
        console.log(e)
    }


})

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/:hash',async (req,res)=>{
    let {hash} = req.params
    try{
    let block = await Moralis.EvmApi.block.getBlock({chain: "0x1",
        blockNumberOrHash: String(hash),})

    res.render('view',{block:block.toJSON()})
    //res.send(block.toJSON().transactions[0])
    }catch(e){console.log(e)}

})


app.use(err404)
app.use((err, req, res, next) => {

    console.error(err.stack);

    res.status(500).send('Something broke!');

});

const PORT = process.env.PORT || 80

async function start() {
    try{       
        server.listen(PORT,() =>{
            console.log(`Server is running on port ${PORT}.`)
        })
    }
    catch(e){
        console.log(e)
    }    
}

start();