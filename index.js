const express = require('express');
const db = require('./db/client.js')
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path')

const app = express();
const port = 5000


//Settings
app.set('view engine', 'ejs');

//Middleware
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());
app.use(helmet());
//Routes

app.get('/', (req, res) => {
    res.render('index');
})


app.get('/users', (req, res) =>{
    db.all(`SELECT * FROM users`, (error, rows) => {
        if(error){
            res.send({ error: 'No good!' });
        }
        res.send({ rows });
    })
})

app.get('/users/:users_id', (req, res) => {
    const { params: { users_id } } = req;
    db.get(`SELECT * FROM users WHERE users_id=$id`,
    {
        $id: users_id
    },
    function(error, row){
        if(error){
            res.json({ error: error.message })
        }
        res.json({row});
    }
    )
})

app.post('/add', (req, res) => {
    const {
        body: { first_name, last_name}
    } = req;
    db.serialize(() => {
        db.run(
            `INSERT INTO 
                users (first_name, last_name) 
                VALUES (
                    $first_name, $last_name
                )
            `,
        {
            $first_name: first_name,
            $last_name: last_name
        }, 
        function(error) {
            if(error) {
                return console.log(error)
            }
            db.get(`SELECT * FROM users WHERE users_id=$id`, {$id: this.lastID }, (error, row) => {
                //console.log(this.lastID);
                if(error){
                    res.json({ eror: 'Error'});
                }
                res.json({ 'A new user has been added: ': row });
            })
        })
    })
});

app.post('/view', (req, res) => {
    const { body: { users_id } } = req;
    db.serialize(() => {
        db.each(`SELECT * FROM users WHERE users_id=$id`, 
        {
            $id: users_id
        },
        (error, row) => {
            if(error){
                res.json( { error: error.message })
            }
            // if(!users_id){
            //     res.json(`No user found with id ${users_id}`)
            // }
            res.json({ row })
        });
    })
})

app.post('/update', (req, res) => {
    const { 
        body: { users_id, first_name, last_name } 
    } = req;
    db.run(`UPDATE users SET first_name=$first_name, 
    last_name=$last_name WHERE users_id=$id`, 
    {
        $first_name: first_name,
        $last_name: last_name,
        $id: users_id   
    },
    function(error) {
        if(error){
            return console.log(error);
        }
        console.log(users_id)
        db.get('SELECT * FROM users WHERE users_id=$id', { $id: users_id }, (error, row) => {
            if (error) {
                res.json({ error: error.message });
            }
            res.json({ 'The user has been updated to: ': row })
        });
        
    });
});

app.post('/delete', (req, res) => {
    const { body: { users_id } } = req;
    db.run(`DELETE FROM users WHERE users_id=$id`, 
    {
        $id: users_id
    },
    function(error){
        if (error){
            res.json( { error: error.message });
        }
        res.json(`The user with id ${users_id} has been succesfully deleted.`)
    });
});

app.get('/close', (req, res)=> {
    db.close((error) => {
        if(error){
            res.json({ error: error.message });
        }
        console.log('Closing the database conection.')
        res.json('Database connection successfully closed.')
    })
})

app.listen(port, () => {
    console.log(`The server is listening to port ${port}`)
})