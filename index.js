const express = require('express');
const jwt = require('jsonwebtoken')
const cors = require('cors');
const cookieParser = require('cookie-parser')

const app = express()

const port = 5000
// middleware

app.use(cors({
    origin:['http://localhost:5173','http://localhost:5174'],
    credentials:true
}))
app.use(express.json())
app.use(cookieParser())

const verifyToken= async(req,res,next)=>{
    const token= req.cookies?.token;
    console.log("value of token in middleware",token);
    if(!token){
        return res.status(401).send({message:'not authorized'})
    }
    jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err,decoded)=>{
        if(err){
            return res.status(401).send({message:'forbidden'})
        }
        console.log('value in  the token', decoded);
        req.user=decoded
        next()
    })
    
}

const secret = 'very very secret kawk bola jabe na'

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://cleanCO:vUvqglnEljD2RWtO@cluster0.whoa8gp.mongodb.net/cleanDB?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const servicesCollection = client.db('cleanDB').collection('services')
        const bookingCollection = client.db('cleanDB').collection('bookings')


        app.get('/api/v1/services', async (req, res) => {
            const cursor = servicesCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/api/v1/user/createBooking', async (req, res) => {
            console.log(req.body);
            const user = req.body;
            const result = await bookingCollection.insertOne(user);
            res.send(result)

        }
        )
        // specefic bookins
        // turjo@a.com
        app.get('/api/v1/user/bookings',verifyToken,async (req, res) => {
            // const userEmail = req.query.email;
            // const tokenEmail = req.user.email;
            // if (tokenEmail !== userEmail) {
            //     return res.status(403).send({ message: 'forbidden access' })
            // }
            // let query = {}
            // if (userEmail) {
            //     query.email = userEmail
            // }
            // const result = await bookingCollection.find(query).toArray
            // res.send(result)\
            if(req.query.email !== req.user.email){
                return res.status(401).send('not authorized')
             }
             let query = {}
             if (req.query?.email) {
                 query = { email: req.query.email }
             }
             const cursor = bookingCollection.find(query)
             const result = await cursor.toArray()
             res.send(result)

        })
        // app.get('/api/v1/user/createBooking', async (req, res) => {
        //     const cursor = bookingCollection.find()
        //     const result = await cursor.toArray()
        //     res.send(result)

        // })
        app.delete('/api/v1/user/createBooking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.deleteOne(query)
            res.send(result)
        })
        // jwt 
        // app.post('/api/v1/auth/accessToken', verifyToken, (req, res) => {
        //     // creating access token and send to the client
        //     const user = req.body;
        //     console.log(user);

        //     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        //         expiresIn: '1h'
        //     });

        //     res
        //         .cookie('token', token, {
        //             httpOnly: true,
        //             secure: false
        //         })
        //         .send({ success: true })

        // })
        app.post('/api/v1/auth/accessToken', async (req, res) => {
            const user = req.body;
            console.log(user);

            const token = jwt.sign(user, secret, {
                expiresIn: '1h'
            });

            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: false
                })
                .send({ success: true })
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('clean co is running')
})

app.listen(port, () => {
    console.log(`clean co server is running on poty: ${port}`);
})