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
    let adress = req.body.adress
    if(!adress){
    if(!hash){return res.send('Block not found')}
    try{
        let block = await Moralis.EvmApi.block.getBlock({chain: "0x1",
            blockNumberOrHash: hash,})

        return res.redirect(`/hash/${hash}`)
    }catch(e){
        console.log(e)
    }}
    if(!hash){
        try{
        let token = await Moralis.EvmApi.token.getWalletTokenBalances({
            chain:'0x1',
            address:adress
        })
        if(!token){
            return console.log('Token not found')
        }
        return res.redirect(`/adress/${adress}`)
    }catch(e){console.log(e)}
    }


})

app.get('/favicon.ico', (req, res) => res.status(204).end());


app.get('/hash/:hash',async (req,res)=>{
    let {hash} = req.params
    try{
    let block = await Moralis.EvmApi.block.getBlock({chain: "0x1",
        blockNumberOrHash: String(hash),})

    res.render('view',{block:block.toJSON()})
    }catch(e){console.log(e)}

})

app.get('/last',async (req,res)=>{
    try{
        let last_block = await Moralis.EvmApi.block.getDateToBlock({
            date:Date.now(),
            chain:'0x1'
        })

        res.redirect(`/hash/${last_block.toJSON().hash}`)
    }catch(e){console.log(e)}
})

app.get('/adress/:adress',async (req,res)=>{
    let {adress} = req.params

    if(!adress){
        return res.send('Adress lost')
    }

    try{
        let token = await Moralis.EvmApi.token.getWalletTokenBalances({
            chain:'0x1',
            address:adress
        })
        if(!token){
            return console.log('Token not found')
        }
        return res.render('adress',{
            token:token.raw,
            adress:adress
        })

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